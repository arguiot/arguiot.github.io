---
title: MVC will really help you debug your code faster
layout: post
date: 2018-05-20 00:00:00 +0000
image: ''
---
---

MVC will really help you debug your code faster
Even the best developers in world are doing mistakes. And the debug can cause them headaches for weeks.
Code is hard to debug because it's not a spoken language, I mean by that that code is very strict and while in a spoken language, structure is not the most important, in code the structure is probably the most important thing because your compiler / linter will help you fix spelling issues.
Here is an example of what I meant:
In English, a beginner may write something like:
I wante too hit
I may exaggerate, but you'll be able to understand.
But In code if you write something like:
want I to eat
The interpreter will just go like that:
WTF?And it will be impossible for a beginner to fix this issue, because each words are spelled correctly.
As a JavaScript developer (I know other language, but I'll focus of JS here because it's the most famous one), debugging can be hard, especially when I didn't write the code, because most people don't care about the structure and write code like:
This code is for form validation
```js
const divs = new Array();
divs[0] = "errFirst";
divs[1] = "errLast";
divs[2] = "errEmail";
divs[3] = "errUid";
divs[4] = "errPassword";
divs[5] = "errConfirm";
function validate() {
    const inputs = new Array();
    inputs[0] = document.getElementById('first').value;
    inputs[1] = document.getElementById('last').value;
    inputs[2] = document.getElementById('email').value;
    inputs[3] = document.getElementById('uid').value;
    inputs[4] = document.getElementById('password').value;
    inputs[5] = document.getElementById('confirm').value;
    const errors = new Array();
    errors[0] = "<span style='color:red'>Please enter your first name!</span>";
    errors[1] = "<span style='color:red'>Please enter your last name!</span>";
    errors[2] = "<span style='color:red'>Please enter your email!</span>";
    errors[3] = "<span style='color:red'>Please enter your user id!</span>";
    errors[4] = "<span style='color:red'>Please enter your password!</span>";
    errors[5] = "<span style='color:red'>Please confirm your password!</span>";
    for (i in inputs) {
        const errMessage = errors[i];
        const div = divs[i];
        if (inputs[i] == "")
            document.getElementById(div).innerHTML = errMessage;
        else if (i == 2) {
            const atpos = inputs[i].indexOf("@");
            const dotpos = inputs[i].lastIndexOf(".");
            if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= inputs[i].length)
                document.getElementById('errEmail').innerHTML = "<span style='color: red'>Enter a valid email address!</span>";
            else
                document.getElementById(div).innerHTML = "OK!";
        } else if (i == 5) {
            const first = document.getElementById('password').value;
            const second = document.getElementById('confirm').value;
            if (second != first)
                document.getElementById('errConfirm').innerHTML = "<span style='color: red'>Your passwords don't match!</span>";
            else
                document.getElementById(div).innerHTML = "OK!";
        } else
            document.getElementById(div).innerHTML = "OK!";
    }
}
function finalValidate() {
    let count = 0;
    for (i = 0; i < 7; i++) {
        const div = divs[i];
        if (document.getElementById(div).innerHTML == "OK!")
            count = count + 1;
    }
    if (count == 6)
        document.getElementById("errFinal").innerHTML = "All the data you entered is correct!!!";
}
```
Without running the code, can you figure out what is the mistake?

But the cool thing with MVC is that code gets a lot more cleaner to read, so the debugging process is a lot faster.
By separating task, if you see that a part of your website doesn't work, you can immediately identify where is the issue, and start debugging efficiently.


---

How to implement MVC in JavaScript?
There is a range of MVC framework out there, but I'm going to focus on ProType, a relatively new MVC framework (that I created) that resemble to what we get in other languages such as Swift.
Here is a simple example of an app to display the time, either by using a digital clock or a watch face, using ProType:
First, let's do the HTML (in the `<body>` tag)
```html
<select class="select">
  <option value="clock">Clock</option>
  <option value="watch">Watch</option>
</select>

<div class="view" protype="clock">
   <h1>Clock</h1>
  <div class="group">
    <div class="h item"></div>
    <div class="m item"></div>
    <div class="s item"></div>
  </div>
</div>
<div class="view watch" protype="watch">
  <h1>Watch</h1>
  <div class="watchGroup">
    <span class="hours"></span>
      <span class="minutes"></span>
      <span class="seconds"></span>
  </div>
</div>
```
Then we'll do the CSS:
```css
h1 {
  font-size: 64px;
}

.view {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  box-sizing: border-box;
  padding: 100px;
  text-align: center;
  background: white;
}
.view .group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.view .group .item {
  color: white;
  font-size: 56px;
  width: 20vw;
  height: 20vw;
  margin: 20px;
  line-height: 20vw;
  vertical-align: middle;
  text-align: center;
  background: #292929;
}

.watchGroup {
  background-color: #fff;
  height: 250px;
  width: 250px;
  border-radius: 50%;
}
.watchGroup::before {
  content: " ";
  width: 20px;
  height: 20px;
  position: absolute;
  background-color: #161C2E;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.watchGroup span {
  height: 80px;
  display: block;
  position: absolute;
  width: 7px;
  background-color: #222;
  transform-origin: 50% 100%;
  bottom: 50%;
  left: calc(50% - 4.5px);
  transition: all 500ms ease-in-out;
}
.watchGroup span.hours {
  width: 8px;
  height: 60px;
  left: calc(50% - 6px);
}
.watchGroup span.seconds {
  width: 5px;
  left: calc(50% - 2.5px);
  height: 85px;
  transition: all 0ms;
}
.watchGroup span.current {
  width: 0px;
  left: 37.5%;
}

.select {
  position: absolute;
  top: 30px;
  left: 40vw;
  right: 40vw;
  margin: 0 auto;
  text-align: center;
  z-index: 100;
}

@keyframes ClockToWatch {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100vw);
  }
}
@keyframes WatchToClock {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100vw);
  }
}
```
And now, the JavaScript:

We'll start by creating a ProType instance:
```js
const P = new ProType()
```
And we'll create the clock Group:
```js
class Clock extends P.Group {

  changeHandler(state) {
    this.h.innerHTML = this.state.hour
    this.m.innerHTML = this.state.min
    this.s.innerHTML = this.state.sec
  }
  setTime() {
    function paddingZeros(n) {
      return n < 10 ? "0" + n : n
    }
    const now = new Date()
    const h = paddingZeros(now.getHours())
    const m = paddingZeros(now.getMinutes())
    const s = paddingZeros(now.getSeconds())
    super.setState({
      hour: h,
      min: m,
      sec: s
    }, this.changeHandler.bind(this))
  }
  init() {
    this.state = {}
    this.h = this.group.querySelector(".h")
    this.m = this.group.querySelector(".m")
    this.s = this.group.querySelector(".s")
    this.i = setInterval(this.setTime.bind(this), 1000 / 30)
  }
}
```
Now, we can create the clock View, and mount the Group:
```js
class ClockView extends P.ViewController {
  willShow() {
    this.g = this.mountGroup(this.view.querySelector(".group"), Clock)
  }
  willDisappear() {
    clearInterval(this.g.i)
  }
}
```
After, we'll create the watch Group:
```js
class Watch extends P.Group {
  changeHandler() {
    this.s.style.transform = `rotateZ(${this.state.sec}deg)`
    this.m.style.transform = `rotateZ(${this.state.min}deg)`
    this.h.style.transform = `rotateZ(${this.state.hour}deg)`
  }
  setTime() {
    function paddingZeros(n) {
      return n < 10 ? "0" + n : n
    }
    const now = new Date()
    const h = paddingZeros(now.getHours())
    const m = paddingZeros(now.getMinutes())
    const s = paddingZeros(now.getSeconds())
    super.setState({
      hour: (h / 12) * 360,
      min: (m / 60) * 360,
      sec: (s / 60) * 360
    }, this.changeHandler.bind(this))
  }
  init() {
    this.state = {}
    this.s = this.group.querySelector(".seconds")
    this.m = this.group.querySelector(".minutes")
    this.h = this.group.querySelector(".hours")
    this.i = setInterval(this.setTime.bind(this), 1000 / 30)
  }
}
```
And we can create our View:
```js
class WatchView extends P.ViewController {
  willShow() {
    this.g = this.mountGroup(this.view.querySelector(".watchGroup"), Watch)
  }
  willDisappear() {
    clearInterval(this.g.i)
  }
}
```
After we created all these class, we can tell ProType to mount them:
```js
P.autoMount(ClockView, WatchView)
P.set("clock")
```
To finish, we'll just add to the <select> tag an event listener so we can switch between Views:
```js
document.querySelector(".select").addEventListener("change", e => {
  const index = e.target.selectedIndex
  if (index == 1) {
    P.performTransition(e.target.options[index].value, {
      animation: "ClockToWatch",
      duration: "500ms"
    })
  } else {
    P.performTransition(e.target.options[index].value, {
      animation: "WatchToClock",
      duration: "500ms"
    })
  }
})
```

---

Pretty easy right? I know that for a beginner, it might seems really hard, and that I could have chosen a better example to illustrate my point, but I think that even a beginner can understand that managing each element individually reduces the probability of having a bug.