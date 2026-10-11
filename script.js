document.querySelector("form").addEventListener("submit", function(event) {
    event.preventDefault();

    alert("Your environmental issue has been reported successfully!");

    this.reset();
});
