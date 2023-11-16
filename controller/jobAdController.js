export const addJobController = (req, res) => {
    console.log(req, "====>>req")
    console.log(req.body, "==>>req.body")
    res.send({ status: 'success', message: 'Job Ad Added' });
}