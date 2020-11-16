function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get(['auth_token'], ({ auth_token }) => {
    if(auth_token) {
      $("form.login").addClass("hidden");
      console.log("auth_token found");

      $(".logout-button").click(event => {
        chrome.storage.local.set({ auth_token: null }, () => {
          console.log("Auth token cleared");
          $("#logged-in").addClass("hidden");
          $("form.login").removeClass("hidden");
        });
      })
    } else {
      console.log("No auth_token found");
      $("#logged-in").addClass("hidden");
      $( ".input" ).focusin(function() {
        $( this ).find( "span" ).animate({"opacity":"0"}, 200);
      });
      
      $( ".input" ).focusout(function() {
        $( this ).find( "span" ).animate({"opacity":"1"}, 300);
      });
      
      $(".login").submit(async event => {
        event.preventDefault();
        $(this).find(".submit i").removeAttr('class');

        let email = document.querySelector("input[type='email']").value;
        let password = document.querySelector("input[type='password']").value;

        if(email && password) {

          let response = await fetch('https://apiv3.videoken.com/api/v2/auth_user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ email, password })
          });

          if(response.ok) {
            let data = await response.json();
            let { auth_token } = data;

            $(this).find(".submit i").addClass("fa fa-check").css({"color":"#fff"});
            $(".submit").css({"background":"#2ecc71", "border-color":"#2ecc71", "pointer-events" : "none"});
            $(".feedback").show().animate({"opacity":"1", "bottom":"-110px"}, 400);
            $("input").css({"border-color":"#2ecc71", "pointer-events" : "none"});

            chrome.storage.local.set({auth_token}, () => {
              console.log("Auth token set");

            });
          } else {
            $(this).find(".submit i").addClass("fa fa-close").css({"color":"#fff"});
            $(".submit").css({"background":"red", "border-color":"red"});
            // $(".feedback").show().animate({"opacity":"1", "bottom":"-110px"}, 400);
            $("input").css({"border-color":"red"});
            return false;
          }
        }

      });
    }
  });

}

document.addEventListener('DOMContentLoaded', restore_options);