const { DateTime } = require("luxon"); // Require the Luxon library

module.exports = function(eleventyConfig) {
  // Passthrough Copy: Copy `css/` folder to `_site/css/`
  eleventyConfig.addPassthroughCopy("css");

  // Add readableDate filter
  eleventyConfig.addFilter("readableDate", dateObj => {
    // Format date to 'dd LLL yyyy' (e.g., 27 Oct 2023)
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });

  // Add htmlDateString filter
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    // Format date to 'yyyy-LL-dd' (e.g., 2023-10-27)
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Return your Object options:
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site"
    }
  };
};