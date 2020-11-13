/*global App _config*/

var App = window.App || {};
var providerId;

(function AppScopeWrapper($) {
    var authToken;
    App.authToken.then(function setAuthToken(token) {
        if (token) {
            //alert("Token: " + token);
            authToken = token;
        } else {
             window.location.href = 'signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = 'signin.html';
    });

    $(function onDocReady() {
        requestUserInfo();
        $('#edit_button').click(handleEditClick);
    });

    function handleEditClick(){
        alert("Edit clicked");
        var newName = document.getElementById("edit_name").value;
        var newAge = document.getElementById("edit_age").value;
        var newAvailability = document.getElementById("edit_availability").value;
        var newContact = document.getElementById("edit_contact").value;
        var newCredentials = document.getElementById("edit_credentials").value;
        var newEmail = document.getElementById("edit_email").value;
        var newGender = document.getElementById("edit_gender").value;
        var newBio = document.getElementById("text_area_bio").value;
        var newLocation = document.getElementById("edit_location").value;
        updateUserInfo(
            newName,
            newAge,
            newAvailability,
            newContact,
            newCredentials,
            newEmail,
            newGender,
            newBio,
            newLocation)
    }

    function updateUserInfo (name, age, avail, contact, creds, email, gender, bio, location){
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/updateinfo',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                ProviderId: providerId,
                UserName: name,
                Age: age,
                Availability: avail,
                ContactInfo: contact,
                Credentials: creds,
                Email: email,
                Gender: gender,
                Bio: bio,
                Location: location
            }),
            contentType: 'application/json',
            success: completeUpdateInfo,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting info: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred while updating your account info.' + JSON.stringify(jqXHR));
                //alert('An error occurred when updating your user Info:\n' + JSON.stringify(jqXHR));
            }
        });
    }

    function completeUpdateInfo(){
        window.location.href = 'profile_provider.html'
    }


    function requestUserInfo() {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/getinfo',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: completeUserInfoRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting info: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured while retrieving your account info.' + JSON.stringify(jqXHR));
                // alert('An error occurred when requesting your user Info:\n' + JSON.stringify(jqXHR));
            }
        });
    }

    function completeUserInfoRequest(result){
        alert (JSON.stringify(result));
        //alert ("username: " + result.Items[0].UserName);
        providerId       = result.Items[0].ProviderId;
        var username     = result.Items[0].UserName;
        var email        = result.Items[0].Email;
        var availability = result.Items[0].Availablility;
        var age          = result.Items[0].Age;
        var bio          = result.Items[0].Bio;
        var contact      = result.Items[0].ContactInfo;
        var credentials  = result.Items[0].Credentials;
        var gender       = result.Items[0].Gender;
        var location     = result.Items[0].Location;
        //var photo        = result.Items[0].PersonalPhoto

        if (username){
            document.getElementById("profileName").innerHTML = "Name: " + username;
        }
        if (email){
            document.getElementById("profileEmail").innerHTML = "Email: " + email;
        }
        if (availability){
            document.getElementById("profileAvailability").innerHTML = "Availability: " + availability;
        }
        if (age){
            document.getElementById("profileAge").innerHTML = "Age: " + age;
        }
        if (bio){
            document.getElementById("profileBio").innerHTML = "Bio: " + bio;
        }
        if (contact){
            document.getElementById("profileContact").innerHTML = "Contact: " + contact;
        }
        if (credentials){
            document.getElementById("profileCredentials").innerHTML = "Credentials: " + credentials;
        }
        if (gender){
            document.getElementById("profileGender").innerHTML = "Gender: " + gender;
        }
        if (location){
            document.getElementById("profileLocation").innerHTML = "Location: " + location;
        }
    }

    //*****
    //*******HANDLE ALIAS CHANGE
    function handleAliasClick(event){
        event.preventDefault();
        var newAlias = prompt ("Enter your new Alias:")
        if (newAlias == null || newAlias == ""){
            alert("cancelled");
        }else{
            updateAlias(newAlias)
        }
    }
    function updateAlias(newAlias){
        alert('new alias will be: '+ newAlias);
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/changealias',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                newAlias: newAlias
            }),
            contentType: 'application/json',
            success: requestUserInfo,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error updating alias: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when updating the alias.');
                // alert('An error occurred when updating alias:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result){
        alert(JSON.stringify(result));
        alert(JSON.stringify(result.matches))
        displayUpdate("this is an update")
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
