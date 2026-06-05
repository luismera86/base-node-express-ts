import cron from "node-cron";
// Cada un segundo se ejecuta la funcion
export const countJob = () => {
    let count = 0;
    cron.schedule("* * * * * *", () => {
        count++;
        console.log("Count job", count);
    });
};
