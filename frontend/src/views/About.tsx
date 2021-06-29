import React from "react";

export default function About() {
  return <div>
    <h1>About RedMetrics2</h1>

    <p className="mt-4">RedMetrics is an <b>open</b> game analytics service meant for developers and researchers</p>
    
    <p className="mt-4">It is open in 2 different ways:</p>
    <ul className="list-disc ml-8">
      <li>Open source - The source code is <a href="https://github.com/play-curious/RedMetrics2">available on GitHub</a></li>
      <li>Open data - Users can see the data that they created. No more wondering what data is being gathered about you</li>
    </ul>

    <p className="mt-4">As compared with <a href="https://github.com/CyberCRI/RedMetrics">version 1</a>, RedMetrics2 adds extra features to make data gathering easier and more secure:</p>
    <ul className="list-disc ml-8">
      <li>An account system for administrators and developers</li>
      <li>Users without accounts can only see data for their own game session</li>
      <li>Better performance for large data sets</li>
    </ul>

    <p className="mt-4">RedMetrics2 was created by <a href="https://playcurious.games">Play Curious</a> and <a href="https://sites.google.com/view/yuvalhart/home">Yuval Hart</a></p>
  </div>;
}
