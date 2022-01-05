const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const ConnectionRepo = require('app/Repositories/ConnectionRepository');

module.exports = async function (req, res, next) {
    let loggedInUser = req.user;
    let friendId = req.params.userId;

    if (friendId) {
        req.connection = await ConnectionRepo.connectionDetail({
            searchParams: {
                [Op.or]: [
                    {userId: loggedInUser.id, friendId: friendId},
                    {friendId: loggedInUser.id, userId: friendId}
                ]
            },
            order: [
                ['degree', 'ASC'],
                ['isFavorite', 'DESC']
            ],
        });
    }
    next();
};
