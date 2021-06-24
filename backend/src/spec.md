# Some specs

## Middlewares

### checkUser

Check if user is login from website using cookies

- **checkUser()** : User is logged-in and `account` property is present in `req`
- **checkUser(condition)** : User is logged-in and user is admin or user validate the condition.

### checkGame

Check if game api-key is valid

- **checkGame()** : Api-key is valid and `account` and `game` properties are present in `req`
- **checkGame(condition)** : Api-key is valid and user is admin or user validate the condition.
