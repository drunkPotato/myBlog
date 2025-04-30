---
title: My Awesome Blog Homepage
layout: base.njk
templateEngineOverride: njk, md  # <-- ADD THIS LINE
---

# Welcome to My Blog!
# ... rest of your intro text ...

## Recent Posts

{% set postslist = collections.post | reverse %} {# Now Nunjucks will understand this #}

<ul>
  {% for post in postslist %}
    <li>
      <a href="{{ post.url }}">
        {{ post.data.title }}
      </a>
      {# Optional: Add the date #}
      {% if post.date %} {# Check if date exists #}
      <time datetime="{{ post.date | htmlDateString }}"> ({{ post.date | readableDate }})</time>
      {% endif %}
    </li>
  {% endfor %}
</ul>