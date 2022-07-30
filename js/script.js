const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray;

let mouse = {
    x:null,
    y:null,
    radius: (canvas.height/80)*(canvas.width/80)
}

window.addEventListener('mousemove',
    function(event){
        mouse.x = event.x;
        mouse.y = event.y;
    }
);

class Particle{
    constructor(x, y, directionX, directionY, size, color){
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2, false);
        ctx.fillStyle = "#808080";
        ctx.fill();
    }
    update(){
        if (this.x > canvas.width || this.x < 0){
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0){
            this.directionY = -this.directionY;
        }

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < mouse.radius + this.size){
            if (mouse.x < this.x && this.x < canvas.width - this.size*10){
                this.x +=10;
            }
            if (mouse.x > this.x && this.x > this.size*10){
                this.x -=10;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size*10){
                this.x +=10;
            }            
            if (mouse.y > this.y && this.y > this.size*10){
                this.y -=10;
            }
        }
        this.x += this.directionX;
        this.y += this.directionY;

        this.draw();
    }

}

// create paricle array 
function init(){
    particlesArray = [];
    let numberOfParticles = (canvas.height*canvas.width) / 15000;
    for (let i = 0; i < numberOfParticles; i++){
        let size = (Math.random() * 5) + 1;
        let x = (Math.random()*((innerWidth - size*2) - (size*2)) + size*2);
        let y = (Math.random()*((innerHeight- size*2) - (size*2)) + size*2);
        let directionX = (Math.random() * 5) - 2.5;
        let directionY = (Math.random() * 5) - 2.5;
        let color = "#808080";
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}
// connect near particles

function connect(){
    let opacity = 0.005;
    for (let a = 0; a <particlesArray.length; a++){
        for (let b = a; b < particlesArray.length; b++){
            let distance = ((particlesArray[a].x - particlesArray[b].x)*(particlesArray[a].x - particlesArray[b].x)) + ((particlesArray[a].y- particlesArray[b].y)*(particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width/10)*(canvas.height/10)) {
                ctx.strokeStyle = 'rgba(1,1,1,' +opacity +')';
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// animation loop 
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++){
        particlesArray[i].update();
    }
    connect();
}

// resize event 

window.addEventListener('resize',
    function(){
        canvas.width = innerHeight;
        canvas.height = innerHeight;
        mouse.radius = ((canvas.height/80)* (canvas.height/80));

    })

//  mouse event loop
window.addEventListener('mouseout',
    function(){
        mouse.x = undefined;
        mouse.y = undefined;
    })

init();
animate();




// Category active
const categoryTitle = document.querySelectorAll('.category-title');
const allCategoryProjects = document.querySelectorAll('.all');

for(let i = 0; i < categoryTitle.length; i++){
    categoryTitle[i].addEventListener('click', filterPosts.bind(this, categoryTitle[i]));
}

function filterPosts(item){
    changeActivePosition(item);
    for(let i = 0; i < allCategoryProjects.length; i++){
        if(allCategoryProjects[i].classList.contains(item.attributes.id.value)){
            allCategoryProjects[i].style.display = "block";
        } else {
            allCategoryProjects[i].style.display = "none";
        }
    }
}

function changeActivePosition(activeItem){
    for(let i = 0; i < categoryTitle.length; i++){
        categoryTitle[i].classList.remove('active');
    }
    activeItem.classList.add('active');
};