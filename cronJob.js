import cron from 'node-cron'

cron.schedule('*/5 * * * * *', () => {
    console.log('running a task every minute');
});