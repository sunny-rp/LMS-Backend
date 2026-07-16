import {BorrowBook} from "../models/borrowbook.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import {User} from "../models/user.model.js";
import { Book } from "../models/book.model.js"; 
import { calculateFine } from "../utils/fineCalculator.js";

export const recordBorrowedBook = catchAsyncErrors(async(req,res,next)=>{
    const {bookId} = req.params;
    const {email} = req.body;

    if(!email){
        return next(new ErrorHandler("Please provide email",400));
    }

    const book = await Book.findById(bookId);
    if(!book){
        return next(new ErrorHandler("Book not found",404));
    }

    const user = await User.findOne({email , accountVerified:true});
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    if(book.quantity === 0){
        return next(new ErrorHandler("Book is out of stock",400));
    }

    const isAlreadyBorrowed =  user.borrowedBooks.find(
        (b)=>b.bookId.toString() === bookId && b.returned === false
    );

    if(isAlreadyBorrowed){
        return next(new ErrorHandler("User has already borrowed this book",400));
    }

    book.quantity -= 1;
    book.availibility = book.quantity > 0;
    await book.save();

    user.borrowedBooks.push({
        bookId: book._id,
        bookTitle: book.title,
        borrowDate: new Date(), 
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
    await user.save();

    await BorrowBook.create({
        user:{
            id: user._id,
            name: user.name,
            email: user.email
        },
        book: book._id,
        price: book.price,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    })

    res.status(200).json({
        success: true,
        message: "Book borrowed successfully",
    });
});

export const returnBorrowedBook = catchAsyncErrors(async(req,res,next)=>{
    const {bookId} = req.params;
    const {email} = req.body;

    const user = await User.findOne({email,accountVerified:true});
    const book = await Book.findById(bookId);

    if(!email){
        return next(new ErrorHandler("Please provide email",400));
    }
    if(!user){
        return next(new ErrorHandler("User not found",404));
    }
    if(!book){
        return next(new ErrorHandler("Book not found",404));
    }

    const borrowedBook = user.borrowedBooks.find(
        (b)=>b.bookId.toString() === bookId && b.returned === false
    ); 

    if(!borrowedBook){
        return next(new ErrorHandler("This book is not borrowed by the user",400));
    }

    borrowedBook.returned = true;
    await user.save();

    book.quantity +=1;
    book.availibility = book.quantity > 0;
    await book.save();

    const borrow = await BorrowBook.findOne({
        book: bookId,
        "user.id": user._id,
        returnDate: null
    })

    if(!borrow){
        return next(new ErrorHandler("You have not borrowed this book",404));
    }

    borrow.returnDate = new Date();
    const fine = calculateFine(borrow.dueDate);
    borrow.fine = fine;
    await borrow.save();

    res.status(200).json({
        success: true,
        message: fine !== 0 ? `Book returned successfully. Total Chargers, including a Fine are: $${fine + borrow.price}` : `Book returned successfully. Total Charges : $${borrow.price}`,
    });


});

export const borrowedBook = catchAsyncErrors(async(req,res,next)=>{
    const {borrowedBooks} = req.user;
    res.status(200).json({
        success: true,
        borrowedBooks,
    });
});

export const getBorrowedBookForAdmin = catchAsyncErrors(async(req,res,next)=>{
    const borrowedBooks = await BorrowBook.find();;
    res.status(200).json({
        success: true,
        borrowedBooks,
    });
});


