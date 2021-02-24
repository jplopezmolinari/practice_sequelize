"use strict";

var db = require("./database");
var Sequelize = require("sequelize");

// Asegurate de que estas corriendo `postgres`!

//---------VVVV---------  tu código abajo  ---------VVV----------
class Task extends Sequelize.Model {}
Task.init(
  {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true, // don't allow empty strings
      },
    },
    complete: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    due: Sequelize.DATE,
  },
  { sequelize: db, modelName: "Task" }
);

//---------^^^---------  tu código arriba ---------^^^----------

module.exports = Task;
