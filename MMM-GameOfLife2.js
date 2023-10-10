Module.register("MMM-GameOfLife2", {

  // Default module config.
  defaults: {
    name: "MMM-GameOfLife2",

    desiredFrameRate: 10,
    resolution: 10,
    canvasWidth: 300,
    canvasHeight: 300,
    textSize: 12,
    notAliveColorCode: "#000000",
    aliveColorCode: "#ffffff",
    surviveNeighbors: "23",
    birthNeighbors: "3",
    lifetime: 1,
  },

  pfive: null,
  frameRate: 10,
  survive: "23",
  birth: "3",
  lifetimeAmount: 1,

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

      let sketch = this.makeSketch(this.config, this.lifetimeAmount, this.frameRate, this.survive, this.birth);
      this.pfive = new p5(sketch, "gameOfLife2Wrapper");
    }
    if (notification === "GOL_RESET") {
      this.resetSketch();
    }
    if (notification === "GOL_FPS") {
      this.frameRate += payload.amount;

      this.updateSketch();
    }
    if (notification === "GOL_LIFETIME") {
      this.lifetimeAmount += payload.amount;
      this.resetSketch();
    }
    if (notification === "GOL_SURVIVE") {
      if (this.survive.match(payload.number)) {
        this.survive = this.survive.replace(payload.number, "");
      }
      else {
        this.survive = this.survive+payload.number;
      }

      this.updateSketch();
    }
    if (notification === "GOL_BIRTH") {
      if (this.birth.match(payload.number)) {
        this.birth = this.birth.replace(payload.number, "");
      }
      else {
        this.birth = this.birth+payload.number;
      }

      this.updateSketch();
    }
    if (notification === "GOL_RESET_SB") {
      if (payload.type === "Birth") {
        this.birth = this.config.birthNeighbors;
      }
      else {
        this.survive = this.config.surviveNeighbors;
      }

      this.updateSketch();
    }
  },

  resetSketch: function() {
    if (this.pfive !== null) {
      this.pfive.remove();
      let sketch = this.makeSketch(this.config, this.lifetimeAmount, this.frameRate, this.survive, this.birth);
      this.pfive = new p5(sketch, "gameOfLife2Wrapper");
    }
  },

  updateSketch: function() {
    if (this.pfive !== null) {
      this.pfive.updateValues(this.lifetimeAmount, this.frameRate, this.survive, this.birth);
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

    if (this.config.lifetime < 1) {
      this.config.lifetime = 1;
    }

    this.frameRate = this.config.desiredFrameRate;
    this.lifetimeAmount = this.config.lifetime;
    this.survive = this.config.surviveNeighbors;
    this.birth = this.config.birthNeighbors;
  },


  makeSketch: function(conf, life, fps, sNeighbors, bNeighbors) {
    return function(pFive) {
      let sortString = (stringg) => {
        return stringg.split("").sort().join("");
      };
      
      let currentGenGrid;
      let lastGenGrid;
      let lastGenGrid2;
      let lastGenGrid3;
      let lastGenGrid4;
      let lastGenGrid5;
      let lastGenGrid6;
      let lastGenGrid7;
      let lastGenGrid8;

      /* user definable parameters */
      let desiredFrameRate = fps;
      let resolution = conf.resolution;
      let canvasWidth = conf.canvasWidth-conf.textSize-3;
      let canvasHeight = conf.canvasHeight-conf.textSize-3;
      let canvasHeightR = conf.canvasHeight;
      let notAliveColorCode = conf.notAliveColorCode;
      let aliveColorCode = conf.aliveColorCode;
      let notAliveColor = getNotAliveColor(notAliveColorCode);
      let survive = sortString(sNeighbors);
      let birth = sortString(bNeighbors);
      let lifetime = life;
      let textSize = conf.textSize;

      /* computed parameters */
      let rows = canvasWidth / resolution;
      let cols = canvasHeight / resolution;


      pFive.setup = function() {
        pFive.frameRate(desiredFrameRate);
        pFive.createCanvas(canvasWidth, canvasHeightR);

        lastGenGrid = makeGrid(rows, cols);
        lastGenGrid2 = makeGrid(rows, cols);
        lastGenGrid3 = makeGrid(rows, cols);
        lastGenGrid4 = makeGrid(rows, cols);
        lastGenGrid5 = makeGrid(rows, cols);
        lastGenGrid6 = makeGrid(rows, cols);
        lastGenGrid7 = makeGrid(rows, cols);
        lastGenGrid8 = makeGrid(rows, cols);
        currentGenGrid = makeGrid(rows, cols);
        fillGridRandomly(currentGenGrid);
      };


      pFive.draw = function() {
        pFive.clear();
        pFive.background(notAliveColor);

        drawGrid(currentGenGrid);
        let nextGenGrid = computeNextGeneration(currentGenGrid);
        drawValues();

        if (representingSameState(nextGenGrid, currentGenGrid) || representingSameState(nextGenGrid, lastGenGrid) || representingSameState(nextGenGrid, lastGenGrid2) || representingSameState(nextGenGrid, lastGenGrid3) || representingSameState(nextGenGrid, lastGenGrid4) || representingSameState(nextGenGrid, lastGenGrid5) || representingSameState(nextGenGrid, lastGenGrid6) || representingSameState(nextGenGrid, lastGenGrid7) || representingSameState(nextGenGrid, lastGenGrid8)) {
          fillGridRandomly(currentGenGrid);
        } else {
          lastGenGrid8 = lastGenGrid7;
          lastGenGrid7 = lastGenGrid6;
          lastGenGrid6 = lastGenGrid5;
          lastGenGrid5 = lastGenGrid4;
          lastGenGrid4 = lastGenGrid3;
          lastGenGrid3 = lastGenGrid2;
          lastGenGrid2 = lastGenGrid;
          lastGenGrid = currentGenGrid;
          currentGenGrid = nextGenGrid;
        }
      };

      pFive.updateValues = function(l,f,s,b) {
        lifetime = l;
        desiredFrameRate = f;
        survive = s;
        birth = b;
        pFive.frameRate(desiredFrameRate);
      }


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

      function drawValues() {
        pFive.fill("#ffffff");
        pFive.textSize(textSize);
        pFive.text("FPS: "+desiredFrameRate, 0, canvasHeight+textSize+3);
        pFive.text("S: "+survive, 90, canvasHeight+textSize+3);
        pFive.text("B: "+birth, 180, canvasHeight+textSize+3);
        pFive.text("Life: "+lifetime, 270, canvasHeight+textSize+3);
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
          let color = pFive.color(aliveColorCode+componentToHex(pFive.floor(255/lifetime*grid[i][j])));
          pFive.fill(color);
          pFive.stroke(color);

          let x = i * resolution;
          let y = j * resolution;
          pFive.rect(x, y, resolution - 1, resolution - 1);
        }
      }

      function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
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

        if (currentState === 0 && (birth.match(aliveNeighbors) !== null)) {
          nextGen[i][j] = lifetime;
        } else if (currentState === lifetime && survive.match(aliveNeighbors) === null) {
          nextGen[i][j] = lifetime-1;
        } else if (currentState > 0 && currentState < lifetime) {
          nextGen[i][j] = currentState-1;
        } else {
          nextGen[i][j] = currentState;
        }
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
        if (grid[x][y] === lifetime) {
          count -= 1;
        }

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
