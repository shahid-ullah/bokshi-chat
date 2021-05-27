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
// let form_data = new FormData();

// $('#OpenImgUpload').click(function(){
//      console.log("the upload is clicked !!!")

//     });

let selectedUserName = null
let currentRecipientName=null

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

// Fetch Friend list
function updateUserList() {
  $.getJSON('api/v1/members/', function (data) {
    userList.children('.user').remove();

    for (let i = 0; i < data.length; i++) {
      // const userItem = `<li class="contact">${data[i]['username']}</li>`;
    // console.log(data[i].socket_connection);
      if (data[i].socket_connection == 0){
        const userItem =
          `
              <div id="selectUser" class="user" onclick="onSelectUser('${data[i]['username']}','${data[i]['username_eng']}')">
                      <li class="media align-items-center px-1  py-2">
                          <div class="img_cont">
                          <img src="../../static/img/user-img.png"alt="user-image" title="user-image" class="rounded-circle user_img">
                          <span class="online_icon offline"></span>
                          </div>
                          <div class="media-body">
                              <div>
                                  <h5 class="m-0">${data[i]['username_eng']}</h5>
                                  <div class="flex align-items-center">
                                       <span><button  class="btn btn-sm btn-primary" onclick="removeUser('${data[i]['username']}')">Remove</button></span>
                                  </div>
                              </div>
                          </div>
                      </li>

            </div>
            `
      $(userItem).appendTo('#user-list');
      }
      else {
        const userItem =
          `
              <div id="selectUser" class="user" onclick="onSelectUser('${data[i]['username']}','${data[i]['username_eng']}')">
                      <li class="media align-items-center px-1  py-2">
                          <div class="img_cont">
                          <img src="../../static/img/user-img.png"alt="user-image" title="user-image" class="rounded-circle user_img">
                          <span class="online_icon"></span>
                          </div>
                          <div class="media-body">
                              <div>
                                  <h5 class="m-0">${data[i]['username_eng']}</h5>
                                  <div class="flex align-items-center">
                                       <span><button  class="btn btn-sm btn-primary" onclick="removeUser('${data[i]['username']}')">Remove</button></span>
                                  </div>
                              </div>
                          </div>
                      </li>

            </div>
            `
      $(userItem).appendTo('#user-list');
      }
    }
  });
}

// Fetch all users from database through api
function onSelectUser(user,username_eng){
  currentRecipientName=username_eng
  setCurrentRecipient(user,username_eng)
  getSharedFiles(user)
}

// set clicked user as currentRecipient
// get all conversation of currentRecipient or currentUser
function setCurrentRecipient(username,username_eng) {

  username_tag = contactProfile.getElementsByTagName('h4')[0]
  username_tag.innerText = username_eng
  currentRecipient = username;
  getConversation(currentRecipient);
  enableInput();
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


// Receive one message and append it to message list
function drawMessage(message) {

  let date = new Date(message.timestamp);
  // const minute=date.toLocaleString('en-US', { minute: 'numeric' })
  const day=date.toLocaleString('en-US', { weekday: 'long'})
  const hour=date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  let body=null;

  // check message contains file or text message
  // if message body is null, this means message only contains files
  if(message.body==="null"){
    var fileName=message.files.split("/");
    fileName=fileName[fileName.length-1]

    body=`<a href=${message.files} target="_blank" >${fileName}</a>`

    addFilesFromSocket(message.files,fileName )
  }
  else{

    if (message.user === currentUser){
      body=message.body
      body = decrypt(body,currentUser)
    }
    else
    {
      body=message.body
      body = decrypt(body,message.user)
    }
  }

  // style message item based on user
  if (message.user === currentUser) {
    // console.log("from current user body",body)
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
    // console.log("from current user body",body)

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
}


// Fetch user uploaded files
function getSharedFiles(user)
{
  $.getJSON(`/api/v1/get-files/?target=${user}`, function (data) {
    fileSharing.children('.shared').remove();

    for (let i = data['results'].length - 1; i >= 0; i--) {

      if(data['results'][i]['files']!=null)
      { let fileName=data['results'][i]['files'].split("/")
        fileName=fileName[fileName.length-1]
        let ext=fileName.split(".")
        let image=['png',"jpg",'jpeg']
        let doc=['doc','docx']
        let excel=['xlsx','xlsm']
        let pdf = ['pdf']

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
        else
        {  sharedItem=
            `
                <a href="${data['results'][i]['files']}" target="_blank" class="shared list-group-item list-group-item-action"><i class="fad fa-file text-success  fa-2x mx-3"></i>${fileName}</a>

                `
        }

        $(sharedItem).appendTo('#file_sharing');
      }

    }

  });

}

function addFilesFromSocket(file,fileName){
  const sharedItem=
    `
            <a href="${file}" target="_blank" class="shared list-group-item list-group-item-action fad fa-file">${fileName}</a>

            `
  $(sharedItem).appendTo('#file_sharing');
}


function removeUser(friend){
  // console.log(friend)
  $.post('api/v1/remove-user/', {
    creator: currentUser,
    friend: friend

  }).fail(function () {
    alert('Error! Check console!');
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


document.getElementById('FileUpload').addEventListener('change', handleFile);

$('#OpenFileUpload').click(function(){
  $('#FileUpload').trigger('click'); }
);


function handleFile(e) {
  uploadedFile = e.target.files[0];

  if(uploadedFile !=null){
    let body=null;
    uploadFile(currentRecipient,body,uploadedFile)
  }
}

// Send message to messages api
function uploadFile(recipient, body,file) {
  let form_data = new FormData();
  form_data.append("files", file);
  form_data.append("recipient",recipient);
  form_data.append("body",body);

  axios.post("/api/v1/message/", form_data, {
    header: {
      "Content-Type": "multipart/form-data"
    }
  })
    .then(response => console.log(response))
}




function onSelectSearchedUser(username){
  $.getJSON(`/api/v1/usersearch/?username=${username}`, function (data) {
    const selctedSearchedUserID = data[0]['id']
    const username_eng=data[0]['username_eng']

    setCurrentRecipient(username,username_eng)
    currentRecipientName=username_eng

    $.post('/api/v1/member/add/', {
      creator: currentUserID,
      friend: selctedSearchedUserID
    }).fail(function () {
      alert('Error! Check console!');
    });

  })
}


searchInput.click(function(){
  drawSearchedUser()

})

function drawSearchedUser(){
  // $("#draw-search-list").children('.remove-child').remove();
  $.getJSON(`/api/v1/usersearch/`, function (data) {
    $("#draw-search-list").children('.remove-child').remove();
    for(let i=0;i<=data.length-1;i++)
    {
      let user=String(data[i]["username_eng"])
      const searchedUser=`<option class="remove-child" value= ${data[i]['username']}> ${data[i]['username_eng']} </option>`
      $(searchedUser).appendTo('#draw-search-list');
    }
  });
}

function decrypt(data, key) {
  return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
}

function encrypt(data, key) {
  return CryptoJS.AES.encrypt(data, key).toString();
}


// run this after loading document tree
$(document).ready(function () {
  updateUserList();
  disableInput();
  // $("#message-box").scrollTop($(document).height());
  // Set usernamme title
  userProfile.getElementsByTagName('h1')[0].innerText=currentUserName
  // let socket = new WebSocket(`ws://127.0.0.1:8000/?session_key=${sessionKey}`);
  var socket = new WebSocket(
    'ws://' + window.location.host +
    '/ws?session_key=${sessionKey}')

  // HTTP GET /api/v1/message/?target=test2 200 [0.87, 127.0.0.1:38868]
  chatInput.keypress(function (e) {
    if (e.keyCode == 13)
      chatButton.click();
  });

  chatButton.click(function () {
    if (chatInput.val().length > 0) {
      let body= chatInput.val();
      // var csrftoken = Cookies.get('csrftoken');
      // console.log(csrftoken);
      // console.log(body);
      //   sendMessage(currentRecipient, chatInput.val(), image);
      body = encrypt(body,currentUser);

      //   var decrypted = CryptoJS.AES.decrypt(encrypted, "123");

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
    console.log('socket onmessage');
    getMessageById(e.data);
  };

});
// <img src="../../static/img/user-img.png"alt="user-image" title="user-image" class="rounded mr-2" height="50" width="50">
