document.addEventListener("DOMContentLoaded", () => {
  const params = {
    appName: "graphing",
    width: 800,
    height: 600,
    showToolBar: false,
    showAlgebraInput: false,
    showMenuBar: false,
    showKeyboardOnFocus: false,
    preventFocus: true,
    appletOnLoad(api) {
      api.evalCommand('SetPerspective("G")');

      api.evalCommand("f(x)=exp(x)");

      // draggable slider
      api.evalCommand("Ax=Slider(-10,10,0.001,1,140,false,true,false,false)");
      api.setRounding("10");

      // point on the curve + derivative point
      api.evalCommand("A=(Ax,f(Ax))");

      // tangent line from derivative
      api.evalCommand("m=f'(Ax)");
      api.evalCommand("t: y=m(x-Ax)+f(Ax)");

      // style tangent line
      api.setColor("t", 220, 40, 40);
      api.setLineThickness("t", 10);

      // style A: larger filled blue point
      api.setColor("A", 40, 90, 220);
      api.setPointSize("A", 8);
      api.setPointStyle("A", 0);

      // labels help the overlap make sense
      api.setLabelVisible("A", true);
    }
  };

  const applet = new GGBApplet(params, true);

  window.addEventListener("load", function () {
    applet.inject("ggb-element");
  });
});