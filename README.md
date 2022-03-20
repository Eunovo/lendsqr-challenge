#### LendSQR Challenge

This demo application provides a simple REST API that allows a user to sign up and perform simple operations on their accounts.

### API

`POST /users`
Creates a new user
```
// Request Body
{
    email: "alice@email.com",
    firstName: "Alice",
    lastName: "Sharapova"
}

// Success Response
{
    message: "success",
    token: "YOUR_TOKEN_HERE"
}
```

`GET /accounts`
Get all user accounts
**Requires that a bearer token is set in the 'Authorization' header**
```
// Success Response
{
    message: "success",
    accounts: [
        {
            account_id: 121,
            user_id: 12,
            balance: 100.0,
            created_at: ,
            updated_at: 
        }, ...
    ]
}
```

`POST /accounts/fund`
Fund an account
**Requires that a bearer token is set in the 'Authorization' header**
```
// Request Body
{
    account_id: 121,
    amount: 500
}

// Success Response
{
    message: "success"
}
```

`POST /accounts/withdraw`
Withdraw from an account
**Requires that a bearer token is set in the 'Authorization' header**
```
// Request Body
{
    account_id: 121,
    amount: 500
}

// Success Response
{
    message: "success"
}
```

`POST /accounts/transfer`
Transfer from one account to another
**Requires that a bearer token is set in the 'Authorization' header**
```
// Request Body
{
    sender_id: 121, // The account_id of the sending account
    receiver_id: 123, // The account_id of the receiving account
    amount: 500
}

// Success Response
{
    message: "success"
}
```