$(function() {
    // Initialise the Zendesk JavaScript API client
    // https://developer.zendesk.com/apps/docs/apps-v2
    var client = ZAFClient.init();

    var url      = window.location.href;
    url = url.split('=');
    url = url[1].split('&');
    var base_url = decodeURIComponent(url[0]); 

    var options = {
        url: base_url + "/api/v2/tickets.json",
        type: 'GET',
        contentType: "application/json",
        cors: true 
    };
    client.request(options).then(
        function(response) {
            for(let i = 0; i < response.count; i++){
                var table = '<tr id="' + i + '">';
                table += '<td class="name"><input id="name_' + i + '"></input></td>';
                table += '<td class="phone" id="phone_' + i + '"></td>';
                table += '<td class="email" id="email_' + i + '"></td>';
                table += '<td class="subject"><input id="subject_' + i + '"></input></td>';
                table += '<td class="status"><input id="status_' + i + '"></input></td>';
                table += '<td class="type"><input id="type_' + i + '"></input></td>';
                table += '<td class="description"><input id="description_' + i + '"></input></td>';
                table += '<td class="tags"><input id="tags_' + i + '"></input></td>';
                table += '</tr>';
                $("#tickets_data").append(table);
            }

            for(let i = 0; i < response.count; i++){
                var ticket = response.tickets[i];
                var options = {
                    url: base_url + "/api/v2/users/" + ticket.requester_id + ".json",
                    type: 'GET',
                    contentType: "application/json",
                    cors: true 
                };
                client.request(options).then(
                    function(requester) {
                        requester = requester.user;
                        $("#name_" + i).val(requester.name);
                        $("#phone_" + i).text(requester.phone);
                        $("#email_" + i).text(requester.email);
                });
                var tags = "";
                for(var tag in ticket.tags){
                    tags += tag + " ";
                }
                
                $("#subject_" + ticket.id).val(ticket.subject);
                $("#status_" + ticket.id).val(ticket.status);
                $("#type_" + ticket.id).val(ticket.type);
                $("#description_" + ticket.id).val(ticket.description);
                $("#tags_" + ticket.id).val(ticket.tags);
                
            } 
    });
    

});  