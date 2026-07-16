import express from "express";
import { borrowedBook,returnBorrowedBook,getBorrowedBookForAdmin,recordBorrowedBook} from "../controllers/borrowbook.controller.js";
import {isAuthenticated} from "../middlewares/authMiddleware.js";
import { isAuthorized } from "../middlewares/authMiddleware.js";


const router = express.Router();


router.route("/my-borrowed-books").get(isAuthenticated, borrowedBook);
router.route("/record-borrowed-book/:bookId").post(isAuthenticated, isAuthorized("Admin"), recordBorrowedBook);
router.route("/borrowed-books-by-users").get(isAuthenticated, isAuthorized("Admin"), getBorrowedBookForAdmin);
router.route("/return-borrowed-book/:bookId").put(isAuthenticated, isAuthorized("Admin"), returnBorrowedBook);


export default router;