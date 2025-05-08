// .eleventy.js
const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/images");

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Custom collection for recent posts (reversed and limited)
  eleventyConfig.addCollection("postsReversedAndLimited", function(collectionApi) {
    const posts = collectionApi.getFilteredByTag("post")
      .slice(0) // Create a shallow copy
      .reverse(); // Reverse to get newest first
    return posts.slice(0, 6); // Then take the first 6 (or fewer if less than 6 exist)
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};