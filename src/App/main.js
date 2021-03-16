import './main.scss'
const dayjs = require("dayjs")
const ProgressBar = require('progressbar.js')
const {$, dataLayer, currency} = window
const Mailcheck = require('mailcheck');

let footer_main_page_url = `https://www.greenpeace.org/taiwan/?ref=2021-plastic_policy_petition`
let footer_donate_url = `https://supporter.ea.greenpeace.org/tw/s/donate?campaign=plastics&ref=2021-plastic_policy_petition-footer`
let footer_privacy_url = `https://www.greenpeace.org/taiwan/policies/privacy-and-cookies/?ref=2021-plastic_policy_petition`

window.directTo = function (type) {
    switch (type){
        case 'main':
            window.open(footer_main_page_url, '_blank');
            break
        case 'donate':
            window.open(footer_donate_url, '_blank');
            break
        case 'privacy':
            window.open(footer_privacy_url, '_blank');
            break
        default: 
        window.open(footer_privacy_url, '_blank');
    }
}

$(document).ready(function() {
    console.log( "ready!" );
    initProgressBar();
    createYearOptions();
    initForm();
    checkEmail();
    init();
});

/**
 * email suggestion / email correction
 */
function checkEmail() {    
	let domains = [
		"me.com",
		"outlook.com",
		"netvigator.com",
		"cloud.com",
		"live.hk",
		"msn.com",
		"gmail.com",
		"hotmail.com",
		"ymail.com",
		"yahoo.com",
		"yahoo.com.tw",
		"yahoo.com.hk"
	];
	let topLevelDomains = ["com", "net", "org"];

	$("#fake_supporter_emailAddress").on('blur', function() {
        console.log($("#fake_supporter_emailAddress").val())
		Mailcheck.run({
			email: $("#fake_supporter_emailAddress").val(),
			domains: domains, // optional
			topLevelDomains: topLevelDomains, // optional
			suggested: (suggestion) => {      
                $('.email-suggestion').remove();
                $(`<div class="email-suggestion">您想輸入的是 <strong id="emailSuggestion">${suggestion.full}</strong> 嗎？</div>`).insertAfter("#fake_supporter_emailAddress");
                
                $(".email-suggestion").click(function() {
                    $("#fake_supporter_emailAddress").val($('#emailSuggestion').html());
                    $('.email-suggestion').remove();
                });
			},
			empty: () => {
				// this.emailSuggestion = null
			}
		});
	});
}

async function initProgressBar() {

    let count = parseInt($('#mc-form [name="numResponses"]').val());
    console.log(count);

    const goal = Math.ceil(count / 5000) * 5000
    console.log(goal);
    $('#petition-goal').html(currency(goal, { precision: 0, separator: ',' }).format());
    $('#petition-count').html(currency(count, { precision: 0, separator: ',' }).format());

    // try {
    //     let response = await fetch('https://act.greenpeace.org/page/widget/713556');
    //     let res = await response.json();
    //     count = res.data.rows.map((item) => {return parseInt(item.columns[4].value)}).reduce((a, b) => {return a + b}, 0);
    //     $('#petition-count').html(currency(count, { precision: 0, separator: ',' }).format());

    // } catch (err) {
    //     console.log(err);
    // }
    let percent = count / goal;

    let bar = new ProgressBar.Line('#progress-bar', {
        strokeWidth: 3,
        easing: 'easeInOut',
        duration: 1400,
        color: '#FFEA82',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'}
    });
    // console.log(percent)
    bar.animate(percent);
}

function createYearOptions() {
    let currYear = new Date().getFullYear()
    $("#fake_supporter_birthYear").append(`<option value="">出生年份</option>`);
    for (var i = 0; i < 80; i++) {
        let option = `<option value="01/01/${currYear-i}">${currYear-i}</option>`

        $("#fake_supporter_birthYear").append(option);
        $('#en__field_supporter_NOT_TAGGED_6').append(option);
    }
}

const resolveEnPagePetitionStatus = () => {
	let status = "FRESH";
	// console.log(window);
	if (window.pageJson.pageNumber === 2) {
		status = "SUCC"; // succ page
	} else {
		status = "FRESH"; // start page
	}

	return status;
};

const initForm = () => {
    console.log('init form')

    $('#center_sign-submit').click(function(e){
        e.preventDefault();
        $("#fake-form").submit();
        console.log("fake-form submitting")
    }).end()

    $.validator.addMethod( //override email with django email validator regex - fringe cases: "user@admin.state.in..us" or "name@website.a"
        'email',
        function(value, element){
            return this.optional(element) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/i.test(value);
        },
        'Email 格式錯誤'
    );

    $.validator.addMethod(
        "taiwan-phone",
        function (value, element) {
            
            const phoneReg6 = new RegExp(/^(0|886|\+886)?(9\d{8})$/).test(value);
			const phoneReg7 = new RegExp(/^(0|886|\+886){1}[2-8]-?\d{6,8}$/).test(value);

            if ($('#fake_supporter_phone').val()) {
                return (phoneReg6 || phoneReg7)
            }
            console.log('phone testing')
            return true
        },
        "電話格式不正確，請只輸入數字 0912345678 和 02-23612351")

    $.validator.addClassRules({ // connect it to a css class
        "email": {email: true},
        "taiwan-phone" : { "taiwan-phone" : true }
    });

    $("#fake-form").validate({
        errorPlacement: function(error, element) {
            console.log(error)
            element.parents("div.form-field:first").after( error );
        },
        submitHandler: function(form) {
            
            // modify the original form
        $('#mc-form [name="Email"]').val($('#fake_supporter_emailAddress').val())
        $('#mc-form [name="LastName"]').val($('#fake_supporter_lastName').val());
        $('#mc-form [name="FirstName"]').val($('#fake_supporter_firstName').val());
        $('#mc-form [name="MobilePhone"]').val($('#fake_supporter_phone').val());
        $('#mc-form [name="OptIn"]').val($('#fake_optin').prop('checked'));
        $('#mc-form [name="Birthdate"]').val(dayjs($('#fake_supporter_birthYear').val()).format("YYYY-MM-DD"));
        //console.log("optin:", $('#mc-form [name="OptIn"]').value);
        // collect values from form
        let formData = new FormData();
        Object.keys($("#mc-form input")).forEach(function (el) {
            let e = $("#mc-form input")[el]
            let v = null;
            if (e.type === "checkbox") {
                // console.log(e)
                v = $('#fake_optin').prop('checked');
            } else {
                v = e.value;
            }
            formData.append(e.name, v);
            // console.log('use', e.name, v)
        });

        // console.log($("#mc-form").attr("action"))
        // need testing
        $(".loading-cover").fadeIn();
        return fetch($("#mc-form").attr("action"), {
            method: "POST",
            body: formData,
        }).then((response) => {
                $(".loading-cover").fadeOut();
                if (response.ok) {
                    return response.json()
                } 
                throw({
                    ok: response.ok,
                    status: response.status,
                    statusText: response.statusText,
                    type: response.type,
                })
            })
            .then((response) => {
                if (response) {
                    console.log("mc form posted")
                    console.log('response', response)
                    window.pageJson.pageNumber = 2;
                    $(".page-1").hide();
                    $(".page-2").show();
                    footer_main_page_url += `_tkpage`;
                    footer_donate_url += `_tkpage`;
                    footer_privacy_url += `_tkpage`;
                    sendPetitionTracking('2021-plastic_policy');
                }
            })
            .catch((error) => {
                console.log(error);
                this.formLoading = false;
                
            });
        },
        invalidHandler: function(event, validator) {
            // 'this' refers to the form
            var errors = validator.numberOfInvalids();
            if (errors) {
                console.log(errors)
                var message = errors == 1
                    ? 'You missed 1 field. It has been highlighted'
                    : 'You missed ' + errors + ' fields. They have been highlighted';
                $("div.error").show();
            } else {
                $("div.error").hide();
            }
        }
    });
}

function init () {
    console.log(window.location.search)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("utm_source") === "dd") {
        $(".donate-btn").hide();
        $(".share-section").removeClass("col-md-4")
        $(".share-section").removeClass("col-sm-6")
        $(".share-section").addClass("col-md-8")
        $(".share-section").addClass("col-sm-12")
        $(".slider-typography").css("position", "relative");
        $(".slider-typography").css("padding-top", "15%");
        $(".line-share-img").hide();

        switch (urlParams.get("utm_content")) {
            case "tp":
                $(".tp-line").show();
                break;
            case "tc":
                $(".tc-line").show();
                break;
            case "ks":
                $(".ks-line").show();
                break;    
            default:
                $(".tp-line").show();
                break
        }
    } else {
        $(".line-share-section").hide()
    }
    
    
    const EN_PAGE_STATUS = resolveEnPagePetitionStatus()
	// console.log("EN_PAGE_STATUS", EN_PAGE_STATUS)
	if (EN_PAGE_STATUS==="FRESH") {
    
        $(".page-2").hide();
        // $('.page-1').hide();
        // $('.page-2').show();


	} else if (EN_PAGE_STATUS==="SUCC") {
        
        $('.page-1').hide();
        $('.page-2').show();
        $("section").hide();
        $("#home").show();
    }
    
    $(".loading-cover").fadeOut();

    $(window).scroll(function () {
        if ($(this).scrollTop() > 100 && $(this).scrollTop() < $('#speakers').offset().top) {
            $('.parallax-bg').show();
        } else {
            $('.parallax-bg').hide();
        }
    });
}

/**
 * Send the tracking event to the ga
 * @param  {string} eventLabel The ga trakcing name, normally it will be the short campaign name. ex 2019-plastic_retailer
 * @param  {[type]} eventValue Could be empty
 * @return {[type]}            [description]
 */
function sendPetitionTracking(eventLabel, eventValue) {
	window.dataLayer = window.dataLayer || [];

	window.dataLayer.push({
	    'event': 'gaEvent',
	    'eventCategory': 'petitions',
	    'eventAction': 'signup',
	    'eventLabel': eventLabel,
	    'eventValue' : eventValue
	});

	window.dataLayer.push({
	    'event': 'fbqEvent',
	    'contentName': eventLabel,
	    'contentCategory': 'Petition Signup'
	});

	window.uetq = window.uetq || [];  
	window.uetq.push ('event', 'signup', {'event_category': 'petitions', 'event_label': eventLabel, 'event_value': 0});
}