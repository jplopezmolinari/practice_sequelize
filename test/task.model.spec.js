/* eslint-disable no-unused-expressions */
"use strict";

var helper = require("./helper");
var expect = require("chai").expect;
var Bluebird = require("bluebird");
var db = require("../models/database");
var Task = require("../models/task.model");

/**
 * Empeza Aquí
 *
 * Estos tests describen el modelo que vas a configurar en models/task.model.js
 *
 */

describe("Task", function () {
  // vacia la base de datos antes de todos los tests
  before(function () {
    return db.sync({ force: true });
  });

  // borra todos los task después de cada spec
  afterEach(function () {
    return db.sync({ force: true });
  });

  describe("Virtual getters", function () {
    describe("timeRemaining", function () {
      xit("retorna el valor Infinity si el task no tiene una fecha de entrega (`due`)", function () {
        var task = Task.build();
        expect(task.timeRemaining).to.equal(Infinity);
      });

      xit("retorna la diferencia entre la fecha de entrega y ahora", function () {
        var oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds

        // crea un task con fecha de entrega a un dia de este punto en el tiempo
        var task = Task.build({
          due: helper.dates.tomorrow(),
        });

        expect(task.timeRemaining).to.be.closeTo(oneDay, 10); // within 10 ms
      });
    });

    describe("overdue", function () {
      xit("es overdue si el due esta en el pasado", function () {
        var task = Task.build({
          due: helper.dates.yesterday(),
        });
        expect(task.overdue).to.be.true;
      });

      xit("no esta overdue si la tarea esta en el pasado pero complete es igual a true", function () {
        var task = Task.build({
          due: helper.dates.yesterday(),
          complete: true,
        });
        expect(task.overdue).to.be.false;
      });

      xit("no es overdue si el due date es en el futuro", function () {
        var task = Task.build({
          due: helper.dates.tomorrow(),
        });
        expect(task.overdue).to.be.false;
      });
    });
  });

  describe("Class methods", function () {
    beforeEach(function () {
      return Bluebird.all([
        Task.create({ name: "t1", due: helper.dates.tomorrow() }),
        Task.create({
          name: "t2",
          due: helper.dates.tomorrow(),
          complete: true,
        }),
        Task.create({ name: "t3", due: helper.dates.yesterday() }),
        Task.create({
          name: "t4",
          due: helper.dates.yesterday(),
          complete: true,
        }),
      ]);
    });

    describe("clearCompleted", function () {
      xit("remueve todos los tasks completos de la base de datos", function () {
        return Task.clearCompleted()
          .then(function () {
            return Task.findAll({ where: { complete: true } });
          })
          .then(function (completedTasks) {
            expect(completedTasks.length).to.equal(0);
            return Task.findAll({ where: { complete: false } });
          })
          .then(function (incompleteTasks) {
            expect(incompleteTasks.length).to.equal(2);
          });
      });
    });

    describe("completeAll", function () {
      xit("marca todos los tasks incompletos como completos", function () {
        return Task.completeAll()
          .then(function () {
            return Task.findAll({ where: { complete: false } });
          })
          .then(function (incompleteTasks) {
            expect(incompleteTasks.length).to.equal(0);
            return Task.findAll({ where: { complete: true } });
          })
          .then(function (completeTasks) {
            expect(completeTasks.length).to.equal(4);
          });
      });
    });
  });

  describe("Instance methods", function () {
    var task;

    beforeEach(function () {
      return Task.create({
        name: "task",
      }).then(function (_task) {
        task = _task;
      });
    });

    describe("addChild", function () {
      xit("debería retornar una promesa para el nuevo hijo", function () {
        return task.addChild({ name: "task2" }).then(function (child) {
          expect(child.name).to.equal("task2");
          expect(child.parentId).to.equal(task.id);
        });
      });
    });

    describe("getChildren", function () {
      beforeEach(function () {
        return task.addChild({ name: "foo" });
      });

      xit("debería retornar una promesa para un arreglo de tareas hijas", function () {
        return task.getChildren().then(function (children) {
          expect(children).to.have.length(1);
          expect(children[0].name).to.equal("foo");
        });
      });
    });

    describe("getSiblings", function () {
      var childrenReferences = [];

      var childBuilder = function () {
        return task.addChild({ name: "foo" }).then(function (child) {
          childrenReferences.push(child);
        });
      };

      //construye dos hijos
      beforeEach(childBuilder);
      beforeEach(childBuilder);

      xit("retorna una promesa para un arreglo de hermanos", function () {
        return childrenReferences[0].getSiblings().then(function (siblings) {
          expect(siblings).to.have.length(1);
          expect(siblings[0].id).to.equal(childrenReferences[1].id);
        });
      });
    });
  });

  describe("un `pre` destroy hook", function () {
    var studyTask;
    beforeEach(function () {
      // hace un `study` task padre
      studyTask = Task.build({ name: "study", due: helper.dates.yesterday() });
      return studyTask.save().then(function (study) {
        // hace dos tasks hijos (`sql` and `express`) y dos tasks no relacionados
        return Bluebird.all([
          Task.create({
            parentId: study.id,
            name: "sql",
            due: helper.dates.yesterday(),
            complete: true,
          }),
          Task.create({
            parentId: study.id,
            name: "express",
            due: helper.dates.tomorrow(),
          }),
          Task.create({ name: "sleep" }),
          Task.create({ name: "eat" }),
        ]);
      });
    });

    describe("remover", function () {
      xit("tambien remueve todos los tasks hijos", function () {
        return studyTask
          .destroy()
          .then(function () {
            return Task.findAll();
          })
          .then(function (tasks) {
            expect(tasks).to.have.length(2);
            tasks.sort(function byName(t0, t1) {
              return t0.name > t1.name;
            });
            expect(tasks[0].name).to.equal("sleep");
            expect(tasks[1].name).to.equal("eat");
          });
      });
    });
  });
});
