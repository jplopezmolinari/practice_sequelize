"use strict";

var db = require("./database");
var Sequelize = require("sequelize");

// Asegurate de que estas corriendo `postgres`!
// Sequelize.Op
//---------VVVV---------  tu código abajo  ---------VVV----------
class Task extends Sequelize.Model {
  addChild(child) {
    return Task.create({ ...child, parentId: this.id });
  }

  getChildren() {
    return Task.findAll({
      where: {
        parentId: this.id,
      },
    });
  }

  getSiblings() {
    return Task.findAll({
      where: {
        parentId: this.parentId,
        id: {
          [Sequelize.Op.not]: this.id,
        },
      },
    });
  }

  static clearCompleted() {
    return Task.destroy({
      where: {
        complete: true,
      },
    });
  }

  static completeAll() {
    return Task.update(
      { complete: true },
      {
        where: {
          complete: false,
        },
      }
    );
  }
}
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
    parentId: {
      type: Sequelize.DataTypes.INTEGER,
    },
    due: Sequelize.DATE,

    timeRemaining: {
      type: Sequelize.DataTypes.VIRTUAL,
      get(task) {
        console.log("TASK", this.id, "___");

        if (!this.due) {
          return Infinity;
        } else {
          return this.due.getTime() - new Date().getTime();
        }
      },
    },

    overdue: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return !this.complete && this.timeRemaining < 0;
      },
    },
  },
  { sequelize: db, modelName: "Task" }
);

Task.addHook("beforeDestroy", (task) => {
  return Task.destroy({
    where: {
      parentId: task.id,
    },
  });
});

//---------^^^---------  tu código arriba ---------^^^----------

module.exports = Task;
