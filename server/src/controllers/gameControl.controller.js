

exports.testapi = async (req, res) =>{
    try {

        res.status(200).json('test ok');

    } catch (error) {
        console.error('Get Error:', error);
        res.status(500).json({
            error: 'Get Error'
        });
    }
}