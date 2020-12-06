/*global App _config*/

var App = window.App || {};
var providerId;
var recipientId;

(function AppScopeWrapper($) {
    var authToken;
    App.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = 'index.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = 'index.html';
    });

    $(function onDocReady() {
        $('#edit_button').click(handleEditClick);
        // $('#edit_button').click(handleEditClickRec);
        $('#changeProfilePicture').click(handleChangeProfilePic);

        const urlParams = new URLSearchParams(window.location.search);
        var profileId = urlParams.get('ProfileId');
        if (profileId != null) {
            getClickedIdInfo(profileId);
        }
        else {
            getUserImage();
            requestUserInfo();
        }
    });

    function getUserImage(){
        //alert("getUserImage called")
        $.ajax({
            method: 'GET',
            url: _config.api.invokeUrl + '/image',
            headers: {
                Authorization: authToken
            },
            contentType: 'application/json',
            success: postImage,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting info: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                //alert('An error occurred when changing your profile picture:\n' + JSON.stringify(jqXHR));
            }
        });
    }

    function postImage(result){
        //alert ("here is the result: " + JSON.stringify(result));
        let buffer=Uint8Array.from(atob(result), c => c.charCodeAt(0));
        //alert ("buffer worked");
        let blob=new Blob([buffer], { type: "image/gif" });
        //alert ("blob worked: " + blob);
        let url=URL.createObjectURL(blob);
        //alert ("url worked: " + url);
        document.getElementById('profilePicture').src = url;
    }

    function getClickedIdInfo(clickedId) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/getclickedinfo',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                ClickedId: clickedId,
            }),
            contentType: 'application/json',
            success: completeClickedInfo,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting info: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred while retrieving that persons info.' + JSON.stringify(jqXHR));
                // alert('An error occurred when requesting your user Info:\n' + JSON.stringify(jqXHR));
            }
        });
    }

    function completeClickedInfo(result) {
        result = result.Items[0];
        //alert("result: " + JSON.stringify(result));
        const urlParams = new URLSearchParams(window.location.search);
        var profileId = urlParams.get('ProfileId');

        var username = result.UserName;
        // alert("Username: " + username);
        var email = result.Email;
        var availability = result.Availablility;
        var age = result.Age;
        var bio = result.Bio;
        var contact = result.ContactInfo;
        var credentials = result.Credentials;
        var gender = result.Gender;
        var location = result.Location;
        //var photo        = result.PersonalPhoto
        document.getElementById("profilePicture").src = 'health_care.png';

        if (username) {
            document.getElementById("profileName").innerHTML = "Name: " + username;
        } else { document.getElementById("profileName").style.display = "none"; }
        if (email) {
            document.getElementById("profileEmail").innerHTML = "Email: " + email;
        } else { document.getElementById("profileEmail").style.display = "none"; }
        if (availability) {
            document.getElementById("profileAvailability").innerHTML = "Availability: " + availability;
        } else { document.getElementById("profileAvailability").style.display = "none"; }
        if (age) {
            document.getElementById("profileAge").innerHTML = "Age: " + age;
        } else { document.getElementById("profileAge").style.display = "none"; }
        if (bio) {
            document.getElementById("profileBio").innerHTML = "Bio: " + bio;
        } else { document.getElementById("profileBio").style.display = "none"; }
        if (contact) {
            document.getElementById("profileContact").innerHTML = "Contact: " + contact;
        } else { document.getElementById("profileContact").style.display = "none"; }
        if (credentials) {
            document.getElementById("profileCredentials").innerHTML = "Credentials: " + credentials;
        } else { document.getElementById("profileCredentials").style.display = "none"; }
        if (gender) {
            document.getElementById("profileGender").innerHTML = "Gender: " + gender;
        } else { document.getElementById("profileGender").style.display = "none"; }
        if (location) {
            document.getElementById("profileLocation").innerHTML = "Location: " + location;
        } else { document.getElementById("profileLocation").style.display = "none"; }
        document.getElementById("editButton").style.display = "none";
        var clickedId;
        if (result.RecipientId != null) {
            clickedId = result.RecipientId;
        }
        else {
            clickedId = result.ProviderId;
        }
        if (profileId != null){
            document.getElementById("profilePicture").src = "health_care.png";
            document.getElementById("changeProfilePicture").style.display = "none";
        }

        $("#viewReviews").click(createViewReviewsClicked(clickedId));
        $("#viewReviews").show();
        $('.spinner').hide();
        $('.content').show();
    }

    function createViewReviewsClicked(revieweeId) {
        return function () {
            window.location.href = 'reviews.html?RevieweeId=' + revieweeId;
        }
    }

    function handelEditClickRec(){
        var newName = document.getElementById("edit_name_rec").value;
        var newCaretaker = document.getElementById("edit_caretaker_rec").value;
        var newPhone = document.getElementById("edit_phone_rec").value;
        var newAddress = document.getElementById("edit_address_rec").value;
        var newState = document.getElementById("edit_state_rec").value;
        var newZip = document.getElementById("edit_zip_rec").value;
        var newEmail = document.getElementById("edit_email_rec").value;
        var newNeeds = document.getElementById("edit_needs_rec").value;


    }

    function handleEditClick() {
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

    function updateUserInfo(name, age, avail, contact, creds, email, gender, bio, location) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/updateinfo',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                ProviderId: providerId,
                RecipientId: recipientId,
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

    function completeUpdateInfo() {
        // alert ("ProviderID: " + providerId);
        // alert ("RecipientID: " + recipientId);
        if (providerId){
            window.location.href = 'profile_provider.html'
        }
        else{
            window.location.href = 'profile_recipient.html'
        }
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

    function completeUserInfoRequest(result) {
        result = result.Items[0];
        //alert(JSON.stringify(result));
        recipientId = result.RecipientId;
        providerId = result.ProviderId;
        var username = result.UserName;
        var email = result.Email;
        var availability = result.Availablility;
        var age = result.Age;
        var bio = result.Bio;
        var contact = result.ContactInfo;
        var credentials = result.Credentials;
        var gender = result.Gender;
        var location = result.Location;
        //var photo        = result.Items[0].PersonalPhoto

        if (username) {
            document.getElementById("profileName").innerHTML = "Name: " + username;
        }
        if (email) {
            document.getElementById("profileEmail").innerHTML = "Email: " + email;
        }
        if (availability) {
            document.getElementById("profileAvailability").innerHTML = "Availability: " + availability;
        }
        if (age) {
            document.getElementById("profileAge").innerHTML = "Age: " + age;
        }
        if (bio) {
            document.getElementById("profileBio").innerHTML = "Bio: " + bio;
        }
        if (contact) {
            document.getElementById("profileContact").innerHTML = "Contact: " + contact;
        }
        if (credentials) {
            document.getElementById("profileCredentials").innerHTML = "Credentials: " + credentials;
        }
        if (gender) {
            document.getElementById("profileGender").innerHTML = "Gender: " + gender;
        }
        if (location) {
            document.getElementById("profileLocation").innerHTML = "Location: " + location;
        }
        $("#viewReviews").hide();
        $('.spinner').hide();
        $('.content').show();
    }


    function handleChangeProfilePic(event){
        event.preventDefault();
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = e => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file)
            reader.onload = readerEvent =>{
                var content = readerEvent.target.result;
                document.getElementById('profilePicture').src = content;
                uploadImageToS3(content);
            }
        }
        input.click();
    }

    function uploadImageToS3(image){
        //alert("this is the image: " + image);
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/image',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                image:image
            }),
            contentType: 'application/json',
            // success: completeRequest,
            success: alert('Your image has been saved'),
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting info: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occurred when changing your profile picture:\n' + JSON.stringify(jqXHR));
            }
        });
    }

}(jQuery));
