/*global App _config AmazonCognitoIdentity AWSCognito*/

var App = window.App || {};


(function scopeWrapper($) {
    var signinUrl = 'signin.html';
    alert ('called scope');
    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };


    var userPool;
    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        alert('user pool configured');
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    App.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
    };

    App.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
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

    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(email, password, [attributeEmail], null,
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
        alert ('doc is ready');
        // $('#signinForm').submit(handleSignin);
        $('#signinButton').click(handleSignin);
        $('#registrationButton').click(handleRegister);
    });

    function handleSignin(event) {
        alert ('handle signin called');
        event.preventDefault();
        // window.location.href = 'profile.html';
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        signin(email, password,
            function signinSuccess() {
                window.location.href = 'account.html';
            },
            function signinError(err) {
                alert('there was an error logging in: '+err);
            }
        );
    }

    function handleRegister(event) {
        alert ('handle register');
        event.preventDefault();
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            alert ('Registration successful. Please check your email inbox or spam folder for your verification code.')
            window.location.href = 'signin.html';
        };
        var onFailure = function registerFailure(err) {
            alert('error: '+ err);
        };
        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

}(jQuery));
