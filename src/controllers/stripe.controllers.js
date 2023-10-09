require("dotenv").config();
const stripe = require("stripe")(process.env.stripeSecretKey);

const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Learn React Today" }],
  [2, { priceInCents: 20000, name: "Learn CSS Today" }],
]);

class StripeController {
  async stripeCheckoutSession(req, res) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: req.body.items.map((item) => {
          const storeItem = storeItems.get(item.id);
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: storeItem.name,
              },
              unit_amount: storeItem.priceInCents,
            },
            quantity: item.quantity,
          };
        }),
        payment_intent_data: {
          metadata: {
            entryId: "651f024cfbae903d1ce91039",
          },
        },

        success_url: `${process.env.apiUrl}/client/success.html`,
        cancel_url: `${process.env.apiUrl}/client/cancel.html`,
      });
      res.json({ url: session.url });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = new StripeController();
