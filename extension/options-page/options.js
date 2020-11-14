function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get(['auth_token'], ({ auth_token }) => {
    if(auth_token) {

    } else {
      $( ".input" ).focusin(function() {
        $( this ).find( "span" ).animate({"opacity":"0"}, 200);
      });
      
      $( ".input" ).focusout(function() {
        $( this ).find( "span" ).animate({"opacity":"1"}, 300);
      });
      
      $(".login").submit(function(event){
        event.preventDefault();
        let success = true;
        $(this).find(".submit i").removeAttr('class');

        setTimeout(() => {
          if(success) {
              $(this).find(".submit i").addClass("fa fa-check").css({"color":"#fff"});
              $(".submit").css({"background":"#2ecc71", "border-color":"#2ecc71"});
              $(".feedback").show().animate({"opacity":"1", "bottom":"-110px"}, 400);
              $("input").css({"border-color":"#2ecc71"});
              return false;
          } else {
              $(this).find(".submit i").addClass("fa fa-close").css({"color":"#fff"});
              $(".submit").css({"background":"red", "border-color":"red"});
              // $(".feedback").show().animate({"opacity":"1", "bottom":"-110px"}, 400);
              $("input").css({"border-color":"red"});
              return false;
          }
        }, 1000);
      });
    }
  });

}

document.addEventListener('DOMContentLoaded', restore_options);