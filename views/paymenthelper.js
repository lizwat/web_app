const stripe = Stripe("pk_test_51KgxQBLaWiOxnQqJzHWDfzZRRQ8cw7peLoSmXQThxWoJyyYSsEzZTkcsIWDEiB9BG4ELceFqUCi25sKMnuy477vp000SM6YtXl"); // Your publishable key here
const elements = stripe.elements();
const card = elements.create("card", { hidePostalCode: true });
card.mount("#payment-card");
const form = document.querySelector("form");
const errors = document.querySelector("#payment-errors");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  stripe.createToken(card).then((res) => {
    if (res.error) {
      errors.textContent = res.error.message;
    } else {
      const stripeToken = document.createElement("input");
      stripeToken.setAttribute("type", "hidden");
      stripeToken.setAttribute("name", "stripeToken");
      stripeToken.setAttribute("value", res.token.id);
      form.appendChild(stripeToken);
      form.submit();
    }
  });
});

