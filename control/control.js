/* ----------
   control.js
   
   Handles manipulation of page elements.
   ---------- */

$(document).ready(function() {
    RubixAnimation.init();
});

function RubixAnimation() {}

RubixAnimation.element = null;
RubixAnimation.speed = 3000;

RubixAnimation.init = function()
{
    RubixAnimation.element = $("#rubixCube");
    RubixAnimation.animate();
    setInterval(RubixAnimation.animate, RubixAnimation.speed * 2 + 1);
};

// Wish this was smoother...
RubixAnimation.animate = function()
{
    RubixAnimation.element.animate({
        "background-position-y": (RubixAnimation.element.height() - 400) + "px"
    },  RubixAnimation.speed, "swing", function() {
            RubixAnimation.element.animate({
                "background-position-y": "0px"
            }, RubixAnimation.speed, "swing");
        }
    );
};