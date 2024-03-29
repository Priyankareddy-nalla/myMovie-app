const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String
    },
    Director: {
        Name: String,
        Bio: String,
        Birth: String
    },
    // Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema(
    {
        Username: { type: String, required: true },
        Password: { type: String, required: true },
        Email: { type: String, required: true },
        Birthday: Date,
        FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
    }
);

//method for encripted password
userSchema.statics.hashPassword = (Password) => {
    return bcrypt.hashSync(Password, 10);
};

//method for validation
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};



let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
