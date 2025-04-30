---
title: My Awesome Blog Homepage
layout: base.njk 
---

# Welcome to My Blog!

This is the beginning of my Eleventy site. I'll be posting book summaries and devlogs here.

## Recent Posts

{% set postslist = collections.post | reverse %} {# Get all posts tagged 'post', newest first #}

<ul>
  {% for post in postslist %}
    <li>
      <a href="{{ post.url }}">
        {{ post.data.title }}
      </a>
      {# Optional: Add the date #}
      <time datetime="{{ post.date | htmlDateString }}"> ({{ post.date | readableDate }})</time>
    </li>
  {% endfor %}
</ul>