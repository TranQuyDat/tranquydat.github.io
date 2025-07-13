/**
* PHP Email Form Validation - v3.10
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');
  let textarea = document.getElementById('message-field');
  let wordCount = document.getElementById('wordCount');
  let maxWords = 2000;

  TextAreaMess();

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

 function php_email_form_submit(thisForm, action, formData) {
  // Tạo query string từ formData
  const params = new URLSearchParams(formData).toString();
  const urlWithParams = `${action}?${params}`;

  fetch(urlWithParams, {
    redirect: "follow",
    method: "GET"
  })
  .then(response => {
    if (response.ok) {
      return response.json(); // trả về JSON thay vì text
    } else {
      throw new Error(`${response.status} ${response.statusText} ${response.url}`);
    }
  })
  .then(data => {
    thisForm.querySelector('.loading').classList.remove('d-block');

    if (data.status === 'success') {
      thisForm.querySelector('.sent-message').classList.add('d-block');
      thisForm.reset();
    } else {
      throw new Error(
        data.message || 'Form submission failed and no error message returned from: ' + action
      );
    }
  })
  .catch((error) => {
    displayError(thisForm, error);
  });
}

function TextAreaMess(){
  
  textarea.addEventListener('input', () => {
    let words = textarea.value.trim().split("");

    // Nếu người dùng xóa hết chỉ còn khoảng trắng
    if (words[0] === "") words = [];

    if (words.length > maxWords) {
      // Cắt bớt xuống đúng 2000 từ
      words = words.slice(0, maxWords);
      textarea.value = words.join(' ');
    }

    wordCount.textContent = words.length;
  });
}

function displayError(thisForm, error) {
  thisForm.querySelector('.loading').classList.remove('d-block');
  thisForm.querySelector('.error-message').innerHTML = error;
  thisForm.querySelector('.error-message').classList.add('d-block');
}

})();
