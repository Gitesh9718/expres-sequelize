'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('comments', 'text', {
          type: Sequelize.TEXT,
          allowNull: false,
       }),
     ]); 
  },

  down: (queryInterface, Sequelize) => {
       return Promise.all([
         queryInterface.changeColumn('comments', 'text', {
           type: Sequelize.STRING,
           allowNull:false
         })
       ])
  }
};
