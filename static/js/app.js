let currentRecipient = '';
let chatInput = $('.chat-input');
let chatButton = $('#btn-send');
let userList = $('#user-list');
let messageList = $('#message-list');
let messageBox = $('#message-box');
let visibleInput=$('input-visibility')
// let contactProfile = $("#contact_profile")
let contactProfile = document.getElementById('receiver')
let userProfile = document.getElementById('user-profile')
let searchInput = $('#search-input')
let fileSharing=$('#file_sharing')
let fileSection=$('#file-section')
let form_data = new FormData();
$('#OpenFileUpload').click(function(){ console.log("upload icon triggered!!");            $('#FileUpload').trigger('click'); });
// $('#OpenImgUpload').click(function(){
//      console.log("the upload is clicked !!!")
    
//     });

let selectedUserName = null

document.getElementById('FileUpload').addEventListener('change', handleFile);

let currentRecipientName=null

function handleFile(e) {
    uploadedFile = e.target.files[0];
    console.log("testitn refreshing");
    if(uploadedFile !=null){
        let body=null;
        uploadFile(currentRecipient,body,uploadedFile)
    }
}

// Fetch all users from database through api
function onSelectUser(user,username_eng){
   
    console.log(username_eng)
    currentRecipientName=username_eng
    setCurrentRecipient(user,username_eng)
     console.log(username_eng)

    getSharedFiles(user)
   
}

function getSharedFiles(user)
{
    $.getJSON(`/api/v1/message/?target=${user}`, function (data) {
        fileSharing.children('.shared').remove();

        
        for (let i = data['results'].length - 1; i >= 0; i--) {
            console.log()
            if(data['results'][i]['files']!=null)
           { let fileName=data['results'][i]['files'].split("/")
             fileName=fileName[fileName.length-1]
             let ext=fileName.split(".")
             let image=['png',"jpg",'jpeg']
             let doc=['doc','docx']
             let excel=['xlsx','xlsm']
             let pdf = ['pdf']
             console.log(ext)
             sharedItem=null
             if(image.includes(ext[ext.length-1]))
              {  sharedItem=
                `
                <a href="${data['results'][i]['files']}" target="_blank" class="shared list-group-item list-group-item-action"><i class="fad fa-file-image text-warning mx-3 fa-2x"></i>${fileName}</a>
                
                `
              }
              else if(doc.includes(ext[ext.length-1]))
              {  sharedItem=
                `
                <a href="${data['results'][i]['files']}" target="_blank" class="shared list-group-item list-group-item-action"><i class="fad fa-file-word text-primary fa-2x mx-3"></i>${fileName}</a>
                
                `
              }
              else if(pdf.includes(ext[ext.length-1]))
              {  sharedItem=
                `
                <a href="${data['results'][i]['files']}" target="_blank" class="shared list-group-item list-group-item-action"><i class="fad fa-file-pdf text-danger fa-2x mx-3"></i>${fileName}</a>
                
                `
              }
              else if(pdf.includes(ext[ext.length-1]))
              {  sharedItem=
                `
                <a href="${data['results'][i]['files']}" target="_blank" class="shared list-group-item list-group-item-action"><i class="fad fa-file-excel text-success  fa-2x mx-3"></i>${fileName}</a>
                
                `
              }
              
            $(sharedItem).appendTo('#file_sharing');
           }
            
        }

    });
    console.log("user selected", user)
}
function addFilesFromSocket(file,fileName){
    const sharedItem=
            `
            <a href="${file}" target="_blank" class="shared list-group-item list-group-item-action">${fileName}</a>
            
            `
            $(sharedItem).appendTo('#file_sharing');
}

function updateUserList() {
    $.getJSON('api/v1/members/', function (data) {
        userList.children('.user').remove();
        console.log(data)

        for (let i = 0; i < data.length; i++) {
            // const userItem = `<li class="contact">${data[i]['username']}</li>`;

            const userItem =
            `
            <div id="selectUser" class="user"   onclick="onSelectUser('${data[i]['username']}','${data[i]['username_eng']}')">
                    <li class="media align-items-center px-1  py-2">
                        <img src="../../static/img/user-img.png" alt="user-image" title="user-image" class="rounded mr-2" height="50" width="50">
                        <div class="media-body">
                            <div>
                                <h5 class="m-0">${data[i]['username_eng']}</h5>
                                <div class="flex align-items-center">
                                    <span>you: this is demo</span>
                                    <span>35m</span>
                                </div>
                            </div>
                        </div>
                    </li>
          
          </div>
          `
            $(userItem).appendTo('#user-list');
        }
        // $('#selectUser').click(function (e) {
        //      selectedUser = $(e.target.value)
        //     // setCurrentRecipient(selected);
        //     console.log(selectedUser)
        // });
        // $('.user').click(function () {
        //     userList.children('.active').removeClass('active');//[the previous selected active username er front end er active class remove hobe]
        //     let selected = event.target;
        //     $(selected).addClass('active');
            // setCurrentRecipient(selected.text);
        // });
    });
}

// Receive one message and append it to message list


$('#selectUser li').click(function(){
    // $(this).addClass(active)
    alert("tttt")
})


function drawMessage(message) {

    let date = new Date(message.timestamp);
    const minute=date.toLocaleString('en-US', { minute: 'numeric' })
    const day=date.toLocaleString('en-US', { weekday: 'long'})

    const hour=date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    const second=date.getSeconds()
    // const day=date.getDay()
    const month=date.toLocaleString('default', { month: 'long' })
    
    
 

    // var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // date=date.toLocaleDateString("en-US")

    // console.log(date.toLocaleDateString("en-US")); // 9/17/2016
    // console.log(today.toLocaleDateString("en-US", options)); // Saturday, September 17, 2016
    // console.log(today.toLocaleDateString("hi-IN", options)); 
    let body=null;
    if(message.body==="null"){
        var fileName=message.files.split("/");
        fileName=fileName[fileName.length-1]

        body=`<a href=${message.files} target="_blank" >${fileName}</a>`
        // console.log("the image is ", message.image)
        addFilesFromSocket(message.files,fileName )
    }
    else{
        body=message.body
    }
    if (message.user === currentUser) {
         const messageItem= `  
                             <li class="px-2 py-2 pb-1 d-flex justify-content-end message">
                                <div class="media sending">
                                    <div class="media-body text-right">
                                        <span class="font-size-12 mb-0 color-gray">${day} ${hour}</span>
                                        <div class="msg-text text-left">
                                          ${body}
                                        </div>
                                    </div>
                                </div>
                            </li>
         
         `
      $(messageItem).appendTo('#message-list');
    }
    else{
         const messageItem=
     `     <li class="px-2 py-2 pb-1  d-flex justify-content-start message">
                 <div class="media comming">
                  <img src="../../static/img/user-img.png" alt="user-image" title="user-image" class="rounded mr-4" height="40" width="40" />
                    <div class="media-body">
                      <span class="font-size-12 mb-0 color-gray">${currentRecipientName}, ${day} ${hour}</span>
                        <div  class="msg-text">
                                ${body}
                 </div>
                 </div>
                </div>
            </li>
         `
    $(messageItem).appendTo('#message-list');
    }


    // $(messageItem).appendTo('#message-list');
    // console.log(currentUser)

}

// Fetch last 20 conversatio from the database
function getConversation(recipient) {
    $.getJSON(`/api/v1/message/?target=${recipient}`, function (data) {
        messageList.children('.message').remove();
        for (let i = data['results'].length - 1; i >= 0; i--) {
            drawMessage(data['results'][i]);
        }

    });

}

// Retrive message by message id and add to messageList
// Access message id from websocket
function getMessageById(message) {
    id = JSON.parse(message).message
    $.getJSON(`/api/v1/message/${id}/`, function (data) {
        if (data.user === currentRecipient ||
            (data.recipient === currentRecipient && data.user == currentUser)) {
            drawMessage(data);
        }
       ;
    });
    updateUserList()
}

// Send message to messages api
function  uploadFile(recipient, body,file) {
   
    let form_data = new FormData();
    form_data.append("files", file);
    form_data.append("recipient",recipient)
    form_data.append("body",body)
    console.log(form_data.get("body"))
    
    console.log(form_data.get("recipient"))






    axios.post("http://127.0.0.1:8000/api/v1/message/", form_data, {
        header: {
            "Content-Type": "multipart/form-data"
        }
    })
        .then(response => console.log(response))
   

}

// set clicked user as currentRecipient
// get all conversation of currentRecipient or currentUser
function setCurrentRecipient(username,username_eng) {
    // console.log(contactProfile);
    
    username_tag = contactProfile.getElementsByTagName('h4')[0]
    // console.log(b[0].innerText);
    console.log("the searched user is",username_eng)
    username_tag.innerText = username_eng
    currentRecipient = username;
    // console.log(username);
    getConversation(currentRecipient);
    enableInput();
}


// Enable input button
function enableInput() {
    chatInput.prop('disabled', false);
    chatButton.prop('disabled', false);
    chatInput.focus();
    // chatInput.show()
    // chatButton.show()
}

// Disable input button
function disableInput() {
    chatInput.prop('disabled', true);
    chatButton.prop('disabled', true);
    // chatInput.hide()
    // chatButton.hide()

}

$(document).ready(function () {
    updateUserList();
    disableInput();
    // $("#message-box").scrollTop($(document).height());
 
    
    userProfile.getElementsByTagName('h1')[0].innerText=currentUserName
//    let socket = new WebSocket(`ws://127.0.0.1:8000/?session_key=${sessionKey}`);
    var socket = new WebSocket(
        'ws://' + window.location.host +
        '/ws?session_key=${sessionKey}')
        // HTTP GET /api/v1/message/?target=test2 200 [0.87, 127.0.0.1:38868]
    chatInput.keypress(function (e) {
        console.log(chatInput.val());
        if (e.keyCode == 13)
            // console.log("enter pressed")

            chatButton.click();
    });
  
   


  chatButton.click(function () {
    if (chatInput.val().length > 0) {
        // console.log((currentRecipient));
        const body= chatInput.val();
      //   sendMessage(currentRecipient, chatInput.val(), image);
        chatInput.val('');
         $.post('/api/v1/message/', {
          recipient: currentRecipient,
          body: body,
          files:null
      }).fail(function () {
          alert('Error! Check console!');
      });
    }
  });

  // Receive message from websocket
  socket.onmessage = function (e) {
    getMessageById(e.data);
    console.log(e.data)
  };
});
function onSelectSearchedUser(username){
    console.log("the user selected")
  
   
    $.getJSON(`/api/v1/usersearch/?username=${username}`, function (data) {
       const selctedSearchedUserID = data[0]['id']
       const username_eng=data[0]['username_eng']
        console.log(selctedSearchedUserID)
        setCurrentRecipient(username,username_eng)
        currentRecipientName=username_eng

            $.post('/api/v1/member/add/', {
                creator: currentUserID,
                friends: selctedSearchedUserID
            }).fail(function () {
                alert('Error! Check console!');
            });
  
})

  
}
// //   $("#user-list").show()

  
  
  
// }
// function onSelectSearchedUser(value){
//     console.log(value);
// }

// $(document).on('change', "#draw-search-list", function(){
//     // alert($(this).val())
   
// });



searchInput.click(function(){
    drawSearchedUser()
   
})

function drawSearchedUser(){
    // $("#draw-search-list").children('.remove-child').remove();
  $.getJSON(`/api/v1/usersearch/`, function (data) {
      console.log(data)
      $("#draw-search-list").children('.remove-child').remove();
    
    for(let i=0;i<=data.length-1;i++)
    {
        let user=String(data[i]["username_eng"])
        const searchedUser=`<option class="remove-chil" value= ${data[i]['username']}> ${data[i]['username_eng']} </option>`
        

       $(searchedUser).appendTo('#draw-search-list');
    }



  });
  



}

// for testing
// const userItem = `<li class="contact">
//     <div class="wrap">
//     <span class="contact-status online"></span>
//     <img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
//     <div class="meta">
//         <p class="name" id="name_id">${data[i]['username']}</p>
//         <p class="preview">You just got LITT up, Mike.</p>
//     </div>
//     </div>
// </li>`
