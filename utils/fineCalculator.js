export const calculateFine = (dueDate)=>{
    const finePerHour = 0.10; // 10 cents per hour
    const today = new Date();
    if(today > dueDate){
        const lateHours = Math.ceil((today - dueDate) / (1000 * 60 * 60)); // Calculate the number of hours late
        const fine = lateHours * finePerHour;
        return fine;
    }
    return 0; // No fine if returned on time
}