---
layout: post
title: How I created my own CAS
date: 2019-12-24 06:00:00 +0100
image: "/uploads/2019/12/21/8CD544C0-5439-4D88-B7B6-E0CD016D458F.jpeg"

---
_This year, I decided to try creating my own Computer Algebraic System (also known as CAS)._

I’m sure we all have used a CAS in our existence, such as WolframAlpha, Photomath, or even SymPy. If they are so popular, it might be easy to create one, right? No, it really isn’t.

When it comes to solving / factorizing simple equations, a human will do it effortlessly, whereas a machine might struggle to do it. It's because humans can process a lot of steps at the same time and can skip some. Computers have to do extra steps before starting executing what it's supposed to do.

First, it has to parse the expression, whereas a human brain will be able to interpret the visual sensation of the equation. Then, the computer will have to convert the `tokens` to a tree

![](/uploads/2019/12/26/medium.png)

> Equation tree of `(1 + 2) - abs(-3) * x²`