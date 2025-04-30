module.exports = function(eleventyConfig) {
    // Passthrough Copy: Copy `css/` folder to `_site/css/`
    eleventyConfig.addPassthroughCopy("css");
  
    // Return your Object options:
    return {
      dir: {
        input: ".",      // Source files are in the root
        includes: "_includes", // Folder for layouts, etc.
        output: "_site"    // Output folder
      }
    };
  };