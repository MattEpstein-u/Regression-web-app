const canvas = document.getElementById('points-canvas');
const ctx = canvas.getContext('2d');
const kSlider = document.getElementById('k-slider');
const kValue = document.getElementById('k-value');
const averageDisplay = document.getElementById('average-display');

let points = [];
const numPoints = 50;
let tempLines = [];
let selectingMode = false;
let currentNewPoint = null;

// Generate random points
function generatePoints() {
    points = [];
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: Math.random() * (canvas.width - 20) + 10,
            y: Math.random() * (canvas.height - 20) + 10,
            value: parseFloat((Math.random() * 10).toFixed(4)),
            isOriginal: true
        });
    }
}

// Draw points on canvas
function drawPoints() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw lines first
    tempLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.from.x, line.from.y);
        ctx.lineTo(line.to.x, line.to.y);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    // Draw points
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${point.value * 25}, 70%, 50%)`; // Color based on value
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(point.value.toFixed(4), point.x + 10, point.y + 5);
    });
}

// Calculate Euclidean distance
function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// Handle canvas click
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (selectingMode && currentNewPoint) {
        const dist = distance({x: clickX, y: clickY}, currentNewPoint);
        if (dist < 10) {
            // User selected the new point, clear lines
            tempLines = [];
            drawPoints();
            selectingMode = false;
            currentNewPoint = null;
            return;
        }
    }

    const newPoint = {x: clickX, y: clickY, value: 0, isOriginal: false};
    const k = parseInt(kSlider.value);

    if (points.length >= k) {
        const distances = points.map(p => ({point: p, dist: distance(newPoint, p)}));
        distances.sort((a, b) => a.dist - b.dist);
        const nearest = distances.slice(0, k);
        const sum = nearest.reduce((acc, d) => acc + d.point.value, 0);
        newPoint.value = parseFloat((sum / k).toFixed(4));
        tempLines = nearest.map(d => ({from: newPoint, to: d.point}));
    } else if (points.length > 0) {
        const sum = points.reduce((acc, p) => acc + p.value, 0);
        newPoint.value = parseFloat((sum / points.length).toFixed(4));
        tempLines = points.map(p => ({from: newPoint, to: p}));
    } else {
        newPoint.value = parseFloat((Math.random() * 10).toFixed(4));
        tempLines = [];
    }

    // Remove the last user-created point if exists
    for (let i = points.length - 1; i >= 0; i--) {
        if (!points[i].isOriginal) {
            points.splice(i, 1);
            break;
        }
    }

    points.push(newPoint);
    drawPoints();
    averageDisplay.textContent = `New point value: ${newPoint.value.toFixed(4)}`;

    // Enter selecting mode
    selectingMode = true;
    currentNewPoint = newPoint;
});

// Update k value display
kSlider.addEventListener('input', () => {
    kValue.textContent = kSlider.value;
});

// Initialize
generatePoints();
drawPoints();
