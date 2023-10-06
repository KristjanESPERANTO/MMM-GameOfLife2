Module.register("MMM-GameOfLife2", {

  // Default module config.
  defaults: {
    name: "MMM-GameOfLife2",

    desiredFrameRate: 1,
    resolution: 10,
    canvasWidth: 300,
    canvasHeight: 300,
    notAliveColorCode: "#000",
    aliveColorCode: "#aaa",
    surviveNeighbors: "23",
    birthNeighbors: "3",
    lifetime: 1,
  },


  start: function() {
    Log.info("Starting module: " + this.name);
    this.sanitizeConfig();
  },


  getDom: function() {
    let wrapper = document.createElement("div");
    wrapper.id = "gameOfLife2Wrapper";

    return wrapper;
  },

  getScripts: function() {
    return [
      "https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.6.0/p5.js"
    ];
  },

  notificationReceived: function(notification, payload, sender) {
    if (notification === "DOM_OBJECTS_CREATED") {
      Log.info("DOM objects are created. Starting P5 …");

      let sketch = this.makeSketch(this.config);
      new p5(sketch, "gameOfLife2Wrapper");
    }
  },


  sanitizeConfig: function() {
    if (this.config.desiredFrameRate < 1) {
      this.config.desiredFrameRate = 1;
    }

    if (this.config.resolution < 2) {
      this.config.resolution = 2;
    }

    if (this.config.canvasWidth < 50) {
      this.config.canvasWidth = 50;
    }

    if (this.config.canvasHeight < 50) {
      this.config.canvasHeight = 50;
    }
  },


  makeSketch: function(conf) {
    return function(pFive) {
      let currentGenGrid;
      let lastGenGrid;

      /* user definable parameters */
      let desiredFrameRate = conf.desiredFrameRate;
      let resolution = conf.resolution;
      let canvasWidth = conf.canvasWidth;
      let canvasHeight = conf.canvasHeight;
      let notAliveColorCode = conf.notAliveColorCode;
      let aliveColorCode = conf.aliveColorCode;
      let notAliveColor = getNotAliveColor(notAliveColorCode);
      let survive = conf.surviveNeighbors;
      let birth = conf.birthNeighbors;
      let lifetime = conf.lifetime;

      /* computed parameters */
      let rows = canvasWidth / resolution;
      let cols = canvasHeight / resolution;


      pFive.setup = function() {
        pFive.frameRate(desiredFrameRate);
        pFive.createCanvas(canvasWidth, canvasHeight);

        lastGenGrid = makeGrid(rows, cols);
        currentGenGrid = makeGrid(rows, cols);
        fillGridRandomly(currentGenGrid);
      };


      pFive.draw = function() {
        pFive.clear();
        pFive.background(notAliveColor);

        drawGrid(currentGenGrid);
        let nextGenGrid = computeNextGeneration(currentGenGrid);

        if (representingSameState(nextGenGrid, currentGenGrid) || representingSameState(nextGenGrid, lastGenGrid)) {
          fillGridRandomly(currentGenGrid);
        } else {
          lastGenGrid = currentGenGrid;
          currentGenGrid = nextGenGrid;
        }
      };


      /*
        "Private functions"
       */

      function getNotAliveColor() {
        if (notAliveColorCode === "transparent") {
          return pFive.color("rgba(0, 0, 0, 0)");
        } else {
          return pFive.color(notAliveColorCode);
        }
      }


      function makeGrid(rows, cols) {
        let array = new Array(rows);

        for (let i = 0; i < rows; i++) {
          array[i] = new Array(cols);
        }

        return array;
      }


      function fillGridRandomly(grid) {
        for (let i = 0; i < grid.length; i++) {
          for (let j = 0; j < grid[i].length; j++) {
            grid[i][j] = pFive.floor(pFive.random(2))*lifetime;
          }
        }
      }


      function drawGrid(grid) {
        for (let i = 0; i < grid.length; i++) {
          for (let j = 0; j < grid[i].length; j++) {
            drawCell(grid, i, j);
          }
        }
      }

      
      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      }

      // this function takes an array of 3 RGB integer values and converts this array into a CSS color, like this: #AAAAA
      function rgbToHex([r, g, b]) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      }

      function combineColors(alive, dead, fac) {
        var rA = parseInt(alive.substring(0,2), 16);
        var gA = parseInt(alive.substring(2,4), 16);
        var bA = parseInt(alive.substring(4,6), 16);
        var rD = parseInt(dead.substring(0,2), 16);
        var gD = parseInt(dead.substring(2,4), 16);
        var bD = parseInt(dead.substring(4,6), 16);
        if (rA < rD) {
          var temp = rA;
          rA = rD;
          rD = temp;
        }
        if (gA < gD) {
          var temp = gA;
          gA = gD;
          gD = temp;
        }
        if (bA < bD) {
          var temp = bA;
          bA = bD;
          bD = temp;
        }
        var r = (rA-rD)*fac+rD;
        var g = (gA-gD)*fac+gD;
        var b = (bA-bD)*fac+bD;
        return rgbToHex(r, g, b);
      }
      
      function drawCell(grid, i, j) {
        let aliveColor = pFive.color(aliveColorCode);

        if (grid[i][j] === lifetime) {
          pFive.fill(aliveColor);
          pFive.stroke(aliveColor);

          let x = i * resolution;
          let y = j * resolution;
          pFive.rect(x, y, resolution - 1, resolution - 1);
        } else if (grid[i][j] > 0) {
          pFive.fill(combineColors(aliveColor, notAliveColor, 1/lifetime*grid[i][j]));
          pFive.stroke(combineColors(aliveColor, notAliveColor, 1/lifetime*grid[i][j]));

          let x = i * resolution;
          let y = j * resolution;
          pFive.rect(x, y, resolution - 1, resolution - 1);
        }
      }

      function computeNextGeneration(currentGen) {
        let nextGen = makeGrid(rows, cols);

        for (let i = 0; i < rows; i++) {
          for (let j = 0; j < cols; j++) {
            computeNextGenCell(i, j, currentGen, nextGen);
          }
        }

        return nextGen;
      }


      function computeNextGenCell(i, j, currentGen, nextGen) {
        let currentState = currentGen[i][j];
        let aliveNeighbors = countAliveNeighbors(currentGen, i, j);

        if (currentState === 0 && shouldBirth(aliveNeighbors)) {
          nextGen[i][j] = 1;
        } else if (currentState === lifetime && shouldDie(aliveNeighbors)) {
          nextGen[i][j] = lifetime-1;
        } else if (currentState > 0) {
          nextGen[i][j] -= 1;
        } else {
          nextGen[i][j] = currentState;
        }
      }


      function shouldBirth(neighbors) {
        return birth.match(neighbors);
      }


      function shouldDie(neighbors) {
        return !survive.match(neighbors);
      }


      function countAliveNeighbors(grid, x, y) {
        let count = 0;

        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            let row = (x + i + rows) % rows;
            let col = (y + j + cols) % cols;
            if (grid[row][col] === lifetime) {
              count += 1;
            }
          }
        }

        count -= grid[x][y];

        return count;
      }


      function representingSameState(leftGrid, rightGrid) {
        for (let i = 0; i < leftGrid.length; i++) {
          for (let j = 0; j < leftGrid.length; j++) {
            if (leftGrid[i][j] !== rightGrid[i][j]) {
              return false;
            }
          }
        }

        return true;
      }
    };
  }
});
