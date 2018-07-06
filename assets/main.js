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
            j = 0;
            var k = response.count;
            for(let i = 1; i <= k; i++){
                while(response.tickets[j].id != i){
                    i++;
                    k++;
                }
                j++;
                var table = '<tr id="' + i + '">';
                table += '<td class="ticket_id"> <a id="id_' + i + '" target="_blank"></a></td>';
                table += '<td class="name"> <a id="name_' + i + '" target="_blank"></a></td>';
                table += '<td class="phone" id="phone_' + i + '"></td>';
                table += '<td class="email" id="email_' + i + '"></td>';
                table += '<td class="subject"><input id="subject_' + i + '"></input></td>';

                table += '<td class="status"><select id="status_' + i + '">';
                table += '<option value="open">open</option>';
                table += '<option value="pending">pending</option>';
                table += '<option value="solved">solved</option>';
                table += '</select></td>';
                
                table += '<td class="type"><select id="type_' + i + '">';
                table += '<option value="" selected disabled>-</option>';
                table += '<option value="question">question</option>';
                table += '<option value="incident">incident</option>';
                table += '<option value="problem">problem</option>';
                table += '<option value="task">task</option>';
                table += '</select></td>';
                
                table += '<td class="description"><textarea id="description_' + i + '" disabled></textarea></td>';
                table += '<td class="tags"><input id="tags_' + i + '"></input></td>';
                table += '</tr>';
                $("#tickets_data").append(table);
            }

            var j = 0;
            console.log(k);
            for(let i = 1; i <= k; i++){
                while(response.tickets[j].id != i){
                    i++;
                }
                var ticket = response.tickets[j];
                j++;
                var options = {
                    url: base_url + "/api/v2/users/" + ticket.requester_id + ".json",
                    type: 'GET',
                    contentType: "application/json",
                    cors: true 
                };
                client.request(options).then(
                    function(requester) {
                        requester = requester.user;

                        $("#name_" + i).attr("href", base_url + "/agent/tickets/" + i +
                            "/requester/assigned_tickets").text(requester.name);
                        //$("#name_" + i).attr("name", requester.id);

                        $("#phone_" + i).text(requester.phone);
                        $("#email_" + i).text(requester.email);
                });
                var tags = "";
                for(var tag in ticket.tags){
                    tags += tag + " ";
                }
                $("#id_" + i).attr("href", base_url + "/agent/tickets/" + i).text(i);
                $("#subject_" + i).val(ticket.subject);
                $("#status_" + i + " option[value='" + ticket.status + "']").attr("selected","selected");
                $("#type_" + i + " option[value='" + ticket.type + "']").attr("selected","selected");
                $("#description_" + i).val(ticket.description);
                $("#tags_" + i).val(ticket.tags);
                
            } 
    });
    
    $(document).on('change', 'select', function() {
        var id = $(this).attr('id').split("_");
        var field_name = id[0];
        var ticket_id = id[1];
        var value = $(this).val();
        var ticket = {};

        if(field_name == "status"){
            ticket = {
                "ticket": { 
                    "status": value
                }
            };
    
        }else if(field_name == "type"){
            ticket = {
                "ticket": { 
                    "type": value
                }
            };
            if(value == ""){
                ticket = {};
            }
        }
        
        ticket = JSON.stringify(ticket);

        var options = {
            url: base_url + "/api/v2/tickets/" + ticket_id + ".json",
            type: 'PUT',
                contentType: "application/json",
            cors: true,
            data: ticket
        };

        client.request(options).then(
            function(ticket) {
                console.log(options);
                console.log(ticket);
        });

    });
    
    $(document).on('change', 'input', function() {
        var id = $(this).attr('id').split("_");
        var field_name = id[0];
        var ticket_id = id[1];
        var value = $(this).val();
        var ticket;

        switch(field_name){
            case "subject": 
                ticket = {
                    "ticket": { 
                        "subject": value
                    }
                };
                break;
            case "tags": 
                ticket = {
                    "ticket": { 
                        "tags": value
                    }
                };
                break;
            default :
                ticket = {};
                break;
        }

        ticket = JSON.stringify(ticket);

        var options = {
            url: base_url + "/api/v2/tickets/" + ticket_id + ".json",
            type: 'PUT',
                contentType: "application/json",
            cors: true,
            data: ticket
        };
        
        client.request(options).then(
            function(ticket) {
                console.log(options);
                console.log(ticket);
        });
    });

});  