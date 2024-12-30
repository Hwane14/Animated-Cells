/**
 * Cells lab 3 starter for IS51030B Graphics
 * Simulate moving cells in 3D environment using kinematics
 * Technical concepts
 *   - creating 2D, 3D vector
     - understanding 3D directions
     - Advanced kinematics
     - Collisions and edge detection
     - WEBGL programming. Texturing, lights
 * by Prashanth Thattai, 2024 <p.thattairavikumar@gold.ac.uk>
 */

var leavesImg; // Global variable for image
let cells = []; // array of cells objects

function preload()
{
    // Tropical leaves image 
    // Created by REPIC_STUDIO on pixabay
    leavesImg = loadImage('assets/leaves.webp');
}

function setup() {
    createCanvas(800, 800, WEBGL);
    createCells(10); // Pushes 5 cells to the empty cells array
    print(cells);
}

function draw() {
    background(255, 81, 125); // clear screen
    
    pointLight(255, 255, 255, mouseX - width/2, mouseY - height/2, width/2);// Emits a white point light from the mouse position
    
    for (var i = 0; i < cells.length; i++)
        {
            if(cells[i].alive())
            {
                
            }
            else
            {
                cells.splice(i, 1);
                print(cells.length);
            }
        }
    
    collideCells(cells);
    
    for (var i = 0; i < cells.length; i++)
        {
          cells[i].detectEdge();
          cells[i].move();
          cells[i].draw();
        }
}


/*
@param {Arguments} : position, velocity, diameter, life properties
*/

function Cell(position, detailX, detailY, velocity, radius, life, txt)
{
    this.position = position;
    this.detailX = detailX;
    this.detailY = detailY;
    this.velocity = velocity;
    this.radius = radius;
    this.life = life;
    this.txt = txt;
    this.acc = createVector(0.01, 0.01, 0.01);
    this.gravity = createVector(0, 0.2, 0);
    
    this.draw = function()
    {
        var rotation = millis()/1000;
        push();// Saves current drawing style settings
        translate(this.position); // Makes this.position the new centre and draws the sphere from there
        rotateX(rotation);// rotates shape in x direction
        rotateY(rotation);// rotates shape in y direction
        rotateZ(rotation);// rotates shape in z direction
        noStroke();
        texture(this.txt);// Gives the shapes the leaves image texture
        sphere(this.radius, this.detailX, this.detailY); // Draws a sphere to the screen with the arguments specified when called
        pop();// Restores drawing style settings
    }
    
    this.move = function()
    {
        mouse = createVector(mouseX, mouseY, 0);
        this.position.add(this.velocity);// This causes the cell to move by adding the velocity to the position every call of the draw loop
        this.velocity.add(this.acc);// Increases the velocity every call of the draw loop
        this.velocity.add(this.gravity);// Adds gravity to cells so they keep dropping
        this.life -= 1;// Reduces this.life by 1 every call of the draw loop
    }
    
    this.detectEdge = function()
    {
        // Variables for edge detection
        var origin = createVector(0, 0, 0);
        var d = this.position.mag() + this.radius - width/2;// Tells you the distance between the edge of the cell and the edge of the canvas(sperical)
        var veldirection = [-1, 1];// An array used to set the velocity direction of the cell once it touches the edge
        
        // Conditions to check if the cell has touched the edge of the screen or is outside of it. Repositions it using delta
        if(this.position.dist(origin) + this.radius > width/2)
            {
                var oldMag = this.position.mag();
                var unitVec = this.position.normalize();// The position of the vector normalised
                unitVec.mult(oldMag - d);// Multiplying the normalised position vector by the old magnitude but with the delta subtracted so it can move back //within the limits
                this.velocity.mult(random(veldirection), random(veldirection), random(veldirection));// Velocity goes in a random positive or negative direction //for x, y, and z.
            }
    }
    
    this.alive = function()
    {
        // This is a combination of the life counter and mitosis so when the life counter reaches 0, that cell is spliced from the array and two new ones with half the diameter are drawn
        if(this.life <= 0)
        {
            for (var i = 0; i < 2; i++)
                {
                    var newPos = this.position.copy();
                    var cell = new Cell(newPos.add(pow((-1), i) * 5),// position
                            floor(random(3, 10)),// detailX
                            floor(random(2, 10)),// detailY
                            p5.Vector.random3D().mult(3),// Velocity
                            this.radius/2,// radius
                            random(10000, 60000),
                            leavesImg);// life
                    
                    cells.push(cell);
                }
            return false;
        }
        return true;
    }
}


/*
 * Initialise the cells array with a number of new Cell objects
 *
 * @param {Integer} n_cells Number of cells for the new array
 * @returns {Array} array of new Cells objects
 */
function createCells(n_cells)
{
    for (var i = 0; i < n_cells; i++)
        {
            var cell = new Cell(createVector(random(-width/2, width/2), random(-height/2, height/2), random(-width/2, width/2)),// position
                                floor(random(3, 25)),// detailX
                                floor(random(2, 25)),// detailY
                                p5.Vector.random3D().mult(3),// Velocity
                                random(60, 90),// radius
                                random(100, 600),// life
                                leavesImg);
            cells.push(cell);// Pushes n_cells number of cells to the cells array
        }
}


/**
 * Collide two cells together
 * @param {Array} cellsArray Array of Cell objects to draw
 */
function collideCells(cellsArray)
{
    for (var i = 0; i < cellsArray.length; i++)
        {
            var cell1 = cellsArray[i];
            for (var j = 0; j < cellsArray.length; j++)
                {
                    var cell2 = cellsArray[j];
                    if(i != j)
                        {
                            var distance = cell1.position.dist(cell2.position);// Distance between the 2 cells
                            if(distance < cell1.radius + cell2.radius)
                            {
                                var delta = cell1.radius + cell2.radius - distance;// How much the 2 cells overlap
                                var unitVector = p5.Vector.sub(cell1.position, cell2.position).normalize();// The unit vector along the collision direction
                                
                                // Moves the cells in opposite directions by multiplying the unit vector with the delta calculated
                                cell1.position.add(unitVector.mult(delta));
                                cell2.position.sub(unitVector.mult(delta));
                                
                                // Velocity unit vectors
                                var positive = cell1.velocity.copy().sub(cell2.velocity).normalize();
                                var negative = positive.copy();
                                
                                // Makes the cells velocity go opposite directions
                                cell1.velocity = negative.mult(-cell1.velocity.mag());
                                cell2.velocity = positive.mult(cell2.velocity.mag());
                            }
                        }
                }
        }
}

