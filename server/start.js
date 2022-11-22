const app = require("./server")

// Connect to mongo db
const db = require("./models");
const Role = db.role;
db.mongoose
    .connect(process.env.MONGO_CONNECTION_STRING, {
        dbName: "StockApp",
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connect to MongoDB.");
        initializeRoles();
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// Set port and listen to requests
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

// Function that initializes roles after connected to db
function initializeRoles() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
            });
            new Role({
                name: "admin"
            }).save(err => {
                if (err) {
                    console.log("error", err);
                }
            });
        }
    });
}