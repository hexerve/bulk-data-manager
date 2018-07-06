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
            for(let i = 1; i <= response.count; i++){
                while(response.tickets[j].id != i){
                    i++;
                    console.log("hi");
                }
                j++;
                //console.log(response.tickets[i - 1].id)
                console.log(i);
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
            for(let i = 0; i < response.count; i++){
                while(response.tickets[j].id != i + 1){
                    i++;
                    console.log("hi");
                }
                j++;
                var ticket = response.tickets[j];
                console.log(ticket);
                var options = {
                    url: base_url + "/api/v2/users/" + ticket.requester_id + ".json",
                    type: 'GET',
                    contentType: "application/json",
                    cors: true 
                };
                client.request(options).then(
                    function(requester) {
                        requester = requester.user;
                        
                        $("#name_" + (i+1)).attr("href", base_url + "/agent/tickets/" + (i + 1) +
                            "/requester/assigned_tickets").text(requester.name);
                        //$("#name_" + (i+1)).attr("name", requester.id);

                        $("#phone_" + (i+1)).text(requester.phone);
                        $("#email_" + (i+1)).text(requester.email);
                });
                var tags = "";
                for(var tag in ticket.tags){
                    tags += tag + " ";
                }

                $("#id_" + (ticket.id)).attr("href", base_url + "/agent/tickets/" + ticket.id).text(ticket.id);
                $("#subject_" + ticket.id).val(ticket.subject);
                $("#status_" + ticket.id + " option[value='" + ticket.status + "']").attr("selected","selected");
                $("#type_" + ticket.id + " option[value='" + ticket.type + "']").attr("selected","selected");
                $("#description_" + ticket.id).val(ticket.description);
                $("#tags_" + ticket.id).val(ticket.tags);
                
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