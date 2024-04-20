const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy; 
const GitHubStrategy = require("passport-github2").Strategy;
const dbConnection = require('./utils/dbConnection')
const bcrypt = require('bcryptjs')

 
passport.use(new GoogleStrategy({ 
 clientID:MYGOOGLECLIENTID, // Данные из вашего аккаунта. 
 clientSecret:MYGOOGLECLIENTSECRET, // Данные из вашего аккаунта. 
 callbackURL:"http://localhost:3000/auth/google/callback", 
 scope: ['email', 'profile'],
 }, 
 async function (accessToken, refreshToken, profile, done) {
  const [row] = await dbConnection.execute(
      "SELECT * FROM `users` WHERE `email`=?",
      [profile.email]
  );
  console.log(row[0]);
  console.log(row == null);
  if (row[0] == undefined) {
      await dbConnection.execute(
          "INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",
          [
              profile.displayName,
              profile.email,
              await bcrypt.hash(accessToken, 12),
          ]
      );
  }
  done(null, profile);
}
));

passport.use(
  new GitHubStrategy(
      {
          clientID: MYGITHUBCLIENTID,
          clientSecret: MYGITHUBCLIENTSECRET,
          callbackURL: "http://localhost:3000/auth/github/callback",
          scope: ["user:email", "profile"],
      },
      async function (accessToken, refreshToken, profile, done) {
          console.log(profile.emails[0].value)
          const [row] = await dbConnection.execute(
              "SELECT * FROM `users` WHERE `email`=?",
              [profile.emails[0].value]
          );

          if (row[0] == undefined) {
              await dbConnection.execute(
                  "INSERT INTO `users`(`name`,`email`,`password`) VALUES(?,?,?)",
                  [
                      profile.username,
                      profile.emails[0].value,
                      await bcrypt.hash(accessToken, 12),
                  ]
              );
          }
          done(null, profile);
      }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});