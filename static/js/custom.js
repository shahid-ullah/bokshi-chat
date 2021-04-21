function setSelectionRange(input, selectionStart, selectionEnd) {
  if (input.setSelectionRange) {
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
  }
  else if (input.createTextRange) {
    var range = input.createTextRange();
    range.collapse(true);
    range.moveEnd('character', selectionEnd);
    range.moveStart('character', selectionStart);
    range.select();
  }
}
$(".emoji-btn").click(function() {
    $("#emojis").toggle();
    $(".emoji-btn").children().children('i').toggleClass('active');
})
/******************/
$("#emojis").disMojiPicker()
$("#emojis").picker(emoji => 
    $('#writeMsg').focus().val(emoji).selectRange(localStorage.getItem('cursor'), localStorage.getItem('cursor') + 1)
);
twemoji.parse(document.body);

/*******************/
$('[data-fancybox="images"]').fancybox({
    afterLoad : function(instance, current) {
        var pixelRatio = window.devicePixelRatio || 1;

        if ( pixelRatio > 1.5 ) {
            current.width  = current.width  / pixelRatio;
            current.height = current.height / pixelRatio;
        }
    }
});
/********************/
function doGetCaretPosition (oField) {

    // Initialize
    var iCaretPos = 0;
  
    // IE Support
    if (document.selection) {
  
      // Set focus on the element
      oField.focus();
  
      // To get cursor position, get empty selection range
      var oSel = document.selection.createRange();
  
      // Move selection start to 0 position
      oSel.moveStart('character', -oField.value.length);
  
      // The caret position is selection length
      iCaretPos = oSel.text.length;
    }
  
    // Firefox support
    else if (oField.selectionStart || oField.selectionStart == '0')
      iCaretPos = oField.selectionDirection=='backward' ? oField.selectionStart : oField.selectionEnd;
  
    // Return results
    return iCaretPos;
}



$("#writeMsg").keyup(function(){
  localStorage.setItem('cursor', doGetCaretPosition(this));
  var val = $(this).val();
  if(val.length  > 0){
      $('.send-button').show();
      $('.attachments-button-wrapper').children('.btn').removeClass('d-none');
      $('.attachments-button-wrapper').children('label').hide();
  }else{
    $('.send-button').hide();
    $('.attachments-button-wrapper').children('label').show();
    $('.attachments-button-wrapper').children('.btn').addClass('d-none');
  }
});
$('.attachments-button-wrapper').children('.btn').click(function(){
    $('.attachments-button-wrapper').children('label').toggle();
})

$.fn.selectRange = function(start, end) {
    if(!end) end = start; 
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};