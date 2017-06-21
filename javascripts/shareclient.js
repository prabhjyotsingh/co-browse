/**
 * Created with IntelliJ IDEA.
 * User: rconline
 * Date: 26/7/13
 * Time: 1:55 PM
 * To change this template use File | Settings | File Templates.
 */


$(document).on('ready', function(){
    $('#HomePage').show();
    $('.nav li').click(function(){
        $(this).parent('ul').children('li').removeClass('active');
        $(this).addClass('active');
        var Name = $(this).children('a').text();
        $('.page').hide();
        $('#' + Name + 'Page').show()
    });
});

function SubmitForm(){
    if($('#croot').val() != 7){
        $('#FailModal').modal('show')
    }
    else{
        $('#SubmitModal').modal('show')
    }
}