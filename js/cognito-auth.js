/*global App _config AmazonCognitoIdentity AWSCognito*/

var App = window.App || {};


(function scopeWrapper($) {
    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };


    var userPool;
    if (!(_config.cognito.userPoolId &&
        _config.cognito.userPoolClientId &&
        _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    App.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
        window.location.href = "index.html";
    };

    function fetchCurrentAuthToken() {
        return new Promise((resolve, reject) => {
            var cognitoUser = userPool.getCurrentUser();
            if (cognitoUser) {
                cognitoUser.getSession(function sessionCallback(err, session) {
                    if (err) {
                        reject(err);
                    } else if (!session.isValid()) {
                        resolve(null);
                    } else {
                        resolve(session.getIdToken().getJwtToken());
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    function parseAuthToken() {
        return App.authToken
            .then(token => parseJwt(token))
            .catch(() => null);
    }

    App.authToken = fetchCurrentAuthToken();
    App.session = parseAuthToken();


    // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library/38552302#38552302
    function parseJwt(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    };


    /*
     * Cognito User Pool functions
     */

    function register(email, password, username, provider, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var isProvider = {
            Name: 'custom:provider',
            Value: provider
        };
        var dataUsername = {
            Name: 'name',
            Value: username
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributeProvider = new AmazonCognitoIdentity.CognitoUserAttribute(isProvider);
        var attributeUserName = new AmazonCognitoIdentity.CognitoUserAttribute(dataUsername);

        userPool.signUp(email, password, [attributeEmail, attributeUserName, attributeProvider], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            });
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: email,
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: email,
            Pool: userPool
        });
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinButton').click(handleSignin);
        $('#registrationButton').click(handleRegister);
    });

    function handleSignin(event) {
        event.preventDefault();
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        signin(email, password,
            function signinSuccess() {
                App.authToken = fetchCurrentAuthToken();
                App.session = parseAuthToken();
                App.session
                    .then(s => {                            
                        if (s['custom:provider'] === "true"){
                            window.location.href = 'profile_provider.html';
                        }else{
                            window.location.href = 'profile_recipient.html';
                        }
                    });
            },
            function signinError(err) {
                alert('there was an error logging in: ' + err);
            }
        );
    }

    function handleRegister(event) {
        event.preventDefault();
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();
        var username = $('#usernameInputRegister').val();
        var provider = "false"
        if (document.getElementById("providerCheck").checked === true) {
            provider = "true"
            alert("provider selected");
        }

        var onSuccess = function registerSuccess(result) {
            alert('Registration successful. Please check your email inbox or spam folder for your verification code.')
            window.location.href = 'index.html';
        };
        var onFailure = function registerFailure(err) {
            alert('error: ' + err);
        };
        if (password === password2) {
            register(email, password, username, provider, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

}(jQuery));