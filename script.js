const scene = new vg.Scene(
    {
      element: document.getElementById("grid"),
      light: new THREE.DirectionalLight(0x16dfaa, 0.2),
      lightPosition: {
        x: 0,
        y: 0,
        z: 0
      },
      cameraPosition: {
        x: 0,
        y: 10,
        z: 0
      }
    },
    false
  ); // false to OrbitControls
  
  const tweenCameraY = new TWEEN.Tween(scene.camera.position)
    .to({ y: 500 }, 3000)
    .start();
  
  // this constructs the cells in grid coordinate space
  const grid = new vg.HexGrid({
    cellSize: 18 // size of individual cells
  });
  
  grid.generate({
    size: 36 // size of the board
  });
  
  const mouse = {
    position: { x: 0, y: 0 },
    update: function() {
      // Empty update function to maintain compatibility
    },
    signal: {
      add: function(callback) {
        // Empty add function to maintain compatibility
        // We'll handle animations differently
      }
    }
  };
  
  const board = new vg.Board(grid);
  
  // this will generate extruded hexagonal tiles
  board.generateTilemap({
    tileScale: 0.945,
    material: new THREE.MeshPhongMaterial({
      color: 0x080808
    })
  });
  
  scene.add(board.group);
  scene.focusOn(board.group);
  mouse.signal.add(function (evt, tile) {
    if (evt === vg.MouseCaster.OVER) {
      let cell = board.grid.pixelToCell(mouse.position);
      if (cell) {
        (function (cell) {
          let cells = board.grid.getNeighbors(cell, false);
          cells.forEach((item, index) => {
            let t = board.getTileAtCell(item);
            let tween = new TWEEN.Tween(t.position)
              .easing(TWEEN.Easing.Quadratic.Out)
              .to({ y: [10, 0] }, 500 + index * 80)
              .start();
          });
        })(cell);
      }
    }
  }, this);
  
  function bumpCells(cell) {
    let cells = [];
  
    let l = board.grid._directions.length;
    let f = Math.floor(Math.random() * l); // from
    let t = Math.floor(Math.random() * (l - 2)) + 3; // total
  
    for (let i = 0; i < t; i++) {
      let c = new vg.Cell();
  
      let j = i + f;
      if (j >= l) {
        j -= l;
      }
  
      c.copy(cell);
      c.add(board.grid._directions[j]);
      let n = board.grid.cells[board.grid.cellToHash(c)] || null;
      if (n) {
        cells.push(n);
      }
    }
  
    // add central cell
    cells.push(cell);
  
    cells.forEach((item, index) => {
      let t = board.getTileAtCell(item);
      if (t) {
        let tween = new TWEEN.Tween(t.position)
          .easing(TWEEN.Easing.Quadratic.Out)
          .to({ y: [20, 0] }, 600 + index * 80)
          .start();
      }
    });
  }
  
  let _time = 0;
  
  update();
  
  function animateRandomCells() {
    let cell = board.grid.getRandomCell();
    if (cell) {
      let cells = board.grid.getNeighbors(cell, false);
      cells.forEach((item, index) => {
        let t = board.getTileAtCell(item);
        if (t) {
          let tween = new TWEEN.Tween(t.position)
            .easing(TWEEN.Easing.Quadratic.Out)
            .to({ y: [10, 0] }, 500 + index * 80)
            .start();
        }
      });
    }
  }
  
  function update(time) {
    if (time - _time > 2000) {
      for (let i = 0; i < 2; i++) {
        animateRandomCells();
      }
      _time = time;
    }
  
    scene.render();
    TWEEN.update();
    requestAnimationFrame(update);
  }
  
  // Navigation functionality
  document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');

    // Open sidebar
    if (openBtn) {
        openBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            sidebar.classList.add('active');
        });
    }

    // Close sidebar
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            sidebar.classList.remove('active');
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnHamburger = openBtn && openBtn.contains(event.target);
        
        if (!isClickInsideSidebar && !isClickOnHamburger && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Close sidebar on window resize if screen becomes large
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close sidebar on mobile if it's open
                if (window.innerWidth < 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                    }
                }

                // Smooth scroll to the section
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
  });

  
  