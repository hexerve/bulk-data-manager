$(function () {
    var k;
    // Initialise the Zendesk JavaScript API client
    // https://developer.zendesk.com/apps/docs/apps-v2
    var client = ZAFClient.init();

    var url = window.location.href;
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
        function (response) {
            j = 0;
            k = response.count;
            for (let i = 1; i <= k; i++) {
                while (response.tickets[j].id != i) {
                    i++;
                    k++;
                }
                j++;
                var table = '<tr id="' + i + '">';
                table += '<td class="selection selection_' + i + '"><input type="checkbox" class="selection" id="selection_' + i + '"></input></td>';
                table += '<td class="ticket_id id_' + i + '"> <a id="id_' + i + '" target="_blank"></a></td>';
                table += '<td class="name name_' + i + '"> <a id="name_' + i + '" target="_blank"></a></td>';
                table += '<td class="phone phone_' + i + '"" id="phone_' + i + '"></td>';
                table += '<td class="email email_' + i + '" id="email_' + i + '"></td>';
                table += '<td class="subject subject_' + i + '"><input id="subject_' + i + '"></input></td>';

                table += '<td class="asignee asignee_' + i + '"><input id="asignee_' + i + '"></input></td>';

                table += '<td class="status status_' + i + '"><select id="status_' + i + '">';
                table += '<option value="open">open</option>';
                table += '<option value="pending">pending</option>';
                table += '<option value="solved">solved</option>';
                table += '</select></td>';

                table += '<td class="type type_' + i + '"><select id="type_' + i + '">';
                table += '<option value="" selected disabled>-</option>';
                table += '<option value="question">question</option>';
                table += '<option value="incident">incident</option>';
                table += '<option value="problem">problem</option>';
                table += '<option value="task">task</option>';
                table += '</select></td>';

                table += '<td class="description description_' + i + '"><textarea id="description_' + i + '" disabled></textarea></td>';
                table += '<td class="tags tags_' + i + '"><input id="tags_' + i + '"></input></td>';
                table += '</tr>';
                $("#tickets_data").append(table);
            }

            var j = 0;
            for (let i = 1; i <= k; i++) {
                while (response.tickets[j].id != i) {
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
                    function (requester) {
                        requester = requester.user;

                        $("#name_" + i).attr("href", base_url + "/agent/tickets/" + i +
                            "/requester/assigned_tickets").text(requester.name);
                        //$("#name_" + i).attr("name", requester.id);

                        $("#phone_" + i).text(requester.phone);
                        $("#email_" + i).text(requester.email);
                    });
                var tags = "";
                for (var tag in ticket.tags) {
                    tags += tag + " ";
                }
                $("#id_" + i).attr("href", base_url + "/agent/tickets/" + i).text(i);
                $("#subject_" + i).val(ticket.subject);
                $("#status_" + i + " option[value='" + ticket.status + "']").attr("selected", "selected");
                $("#type_" + i + " option[value='" + ticket.type + "']").attr("selected", "selected");
                $("#description_" + i).val(ticket.description);
                $("#tags_" + i).val(ticket.tags);

            }
        });

    $(document).on('change', 'select', function () {
        var id = $(this).attr('id').split("_");
        var field_name = id[0];
        var ticket_id = id[1];
        var value = $(this).val();
        var ticket = {};

        if (field_name == "status") {
            ticket = {
                "ticket": {
                    "status": value
                }
            };

        } else if (field_name == "type") {
            ticket = {
                "ticket": {
                    "type": value
                }
            };
            if (value == "") {
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
            function (ticket) { });

    });

    $(document).on('change', 'input', function () {
        var id = $(this).attr('id').split("_");
        var field_name = id[0];
        var ticket_id = id[1];

        if (isNaN(ticket_id)) {
            return;
        }

        var value = $(this).val();
        var ticket;
        switch (field_name) {
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
            default:
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
            function (ticket) { });
    });

    $(document).on('click', '#button1', function () {
        shiftColumnToBegining("id");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#id_left', function () {
        shiftLeftColumn("id");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#id_right', function () {
        shiftRightColumn("id");
    });


    $(document).on('click', '#button2', function () {
        shiftColumnToBegining("name");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#name_left', function () {
        shiftLeftColumn("name");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#name_right', function () {
        shiftRightColumn("name");
    });


    $(document).on('click', '#button3', function () {
        shiftColumnToBegining("phone");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#phone_left', function () {
        shiftLeftColumn("phone");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#phone_right', function () {
        shiftRightColumn("phone");
    });


    $(document).on('click', '#button4', function () {
        shiftColumnToBegining("email");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#email_left', function () {
        shiftLeftColumn("email");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#email_right', function () {
        shiftRightColumn("email");
    });


    $(document).on('click', '#button5', function () {
        shiftColumnToBegining("subject");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#subject_left', function () {
        shiftLeftColumn("subject");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#subject_right', function () {
        shiftRightColumn("subject");
    });


    $(document).on('click', '#button6', function () {
        shiftColumnToBegining("status");
    });

    $(document).on('click', '#status_left', function () {
        shiftLeftColumn("status");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#status_right', function () {
        shiftRightColumn("status");
    });


    $(document).on('click', '#button7', function () {
        shiftColumnToBegining("type");
    });

    $(document).on('click', '#type_left', function () {
        shiftLeftColumn("type");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#type_right', function () {
        shiftRightColumn("type");
    });


    $(document).on('click', '#button8', function () {
        shiftColumnToBegining("description");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#description_left', function () {
        shiftLeftColumn("description");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#description_right', function () {
        shiftRightColumn("description");
    });


    $(document).on('click', '#button9', function () {
        shiftColumnToBegining("tags");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#tags_left', function () {
        shiftLeftColumn("tags");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#tags_right', function () {
        shiftRightColumn("tags");
    });

    $(document).on('click', '#sort_id', function () {
        sortTable("id");
    });

    $(document).on('click', '#sort_name', function () {
        sortTable("name");
    });

    $(document).on('click', '#sort_phone', function () {
        sortTable("phone");
    });

    $(document).on('click', '#sort_email', function () {
        sortTable("email");
    });

    $(document).on('click', '#sort_subject', function () {
        sortTable("subject");
    });

    $(document).on('click', '#sort_status', function () {
        sortTable("status");
    });

    $(document).on('click', '#sort_type', function () {
        sortTable("type");
    });

    $(document).on('click', '#sort_desc', function () {
        sortTable("description");
    });

    $(document).on('click', '#sort_tags', function () {
        sortTable("tags");
    });

    $(document).on('click', '#selection', function () {
        deleteSelectedTickets();
    });

    function shiftRightColumn(field) {
        var leftSibiling = [];

        var rightSibiling = $("#" + field).next().attr("id");
        var i = 0;
        var indexes = $("#" + field).prev().attr("id");
        while (indexes !== undefined) {
            leftSibiling[i] = indexes;
            indexes = $("#" + leftSibiling[i]).prev().attr("id");
            i++;
        }
        shiftColumnToBegining(rightSibiling);

        for (i = 0; i < leftSibiling.length; i++) {
            shiftColumnToBegining(leftSibiling[i]);
        }
    }

    function shiftLeftColumn(field) {
        var leftSibiling = [];
        var i = 0;
        var indexes = $("#" + field).prev().attr("id");
        while (indexes !== undefined) {
            leftSibiling[i] = indexes;
            indexes = $("#" + leftSibiling[i]).prev().attr("id");
            i++;
        }
        shiftColumnToBegining(field);
        leftSibiling.shift();

        for (i = 0; i < leftSibiling.length; i++) {
            shiftColumnToBegining(leftSibiling[i]);
        }
    }

    function shiftColumnToBegining(field) {
        for (i = 1; i <= k; i++) {
            var col = $("." + field + "_" + i);
            $("." + field + "_" + i).remove();
            $("#" + i).prepend(col);
        }
        var headCol = $("#" + field);
        $("#" + field).remove();
        $("#heading").prepend(headCol);
    }

    function sortTable(column) {
        var rows, switching, i, j, x, y, shouldSwitch;
        switching = true;

        /*Make a loop that will continue until
        no switching has been done:*/
        while (switching) {
            //start by saying: no switching is done:
            switching = false;
            rows = $("#tickets_data TR");
            /*Loop through all table rows (except the
            first, which contains table headers):*/
            for (i = 1; i < (rows.length - 1); i++) {
                //start by saying there should be no switching:
                shouldSwitch = false;
                /*Get the two elements you want to compare,
                one from current row and one from the next:*/
                if (column == "id" || column == "name" || column == "phone" || column == "email") {
                    x = $("#" + column + "_" + $(rows[i]).attr("id")).text();
                    y = $("#" + column + "_" + $(rows[i + 1]).attr("id")).text();
                } else {
                    x = $("#" + column + "_" + $(rows[i]).attr("id")).val();
                    y = $("#" + column + "_" + $(rows[i + 1]).attr("id")).val();
                }
                if (column == "id") {
                    //check if the two rows should switch place:
                    if (parseInt(x) < parseInt(y)) {
                        //if so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                } else {
                    //check if the two rows should switch place:
                    if (column == "type") {
                        if (x == null) {
                            x = "a";
                        }
                        if (y == null) {
                            y = "a";
                        }
                    }
                    if (x.toLowerCase() > y.toLowerCase()) {
                        //if so, mark as a switch and break the loop:
                        shouldSwitch = true;
                        break;
                    }
                }
            }
            if (shouldSwitch) {
                /*If a switch has been marked, make the switch
                and mark that a switch has been done:*/
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }

    function deleteSelectedTickets() {
        var ids = "";
        rows = $("#tickets_data TR");
        for (i = parseInt($(rows[1]).attr("id")) - 1; i < rows.length; i++) {
            if ($("#selection_" + i).is(":checked")) {
                ids += i;
                ids += ",";
            }
        }
        ids = ids.slice(0, ids.length - 1);

        if (ids != "") {
            var options = {
                url: base_url + "/api/v2/tickets/destroy_many.json?ids=" + ids,
                type: 'DELETE',
                contentType: "application/json",
                cors: true
            };
            client.request(options).then(
                function (response) {
                    console.log(response);
                });
            location.reload(true);

        }
    }

});
