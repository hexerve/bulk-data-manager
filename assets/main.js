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
        url: base_url + "/api/v2/ticket_audits.json?include=users&comments",
        type: 'GET',
        contentType: "application/json",
        cors: true
    };
    client.request(options).then(
        function (response) {

            let test = [];

            function ifExist(id) {
                for (j = 0; j < test.length; j++) {
                    if (id == test[j]) {
                        return true;
                    }
                }
                return false;
            }

            k = response.audits.length;
            var max = 0;

            for (i = 0; i < k; i++) {
                if (!ifExist(response.audits[i].ticket_id)) {
                    test.push(response.audits[i].ticket_id);
                    if (max < response.audits[i].ticket_id) {
                        max = response.audits[i].ticket_id;
                    }
                }
            }

            i = 0;
            while (!ifExist(i + 1) && i <= max) {
                i++;
            }
            for (let j = 0; j < test.length; j++) {
                var table = '<tr id="' + i + '">';
                table += '<td class="selection selection_' + i + '"><input type="checkbox" class="selection" id="selection_' + i + '"></input></td>';
                table += '<td class="ticket_id id_' + i + '"> <a id="id_' + i + '" target="_blank"></a></td>';
                table += '<td class="name name_' + i + '"> <a id="name_' + i + '" target="_blank"></a></td>';
                table += '<td class="phone phone_' + i + '"" id="phone_' + i + '"></td>';
                table += '<td class="email email_' + i + '" id="email_' + i + '"></td>';
                table += '<td class="subject subject_' + i + '"><input id="subject_' + i + '"></input></td>';

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

                table += '<td class="description description_' + i + '">' +
                    '<div id="description_' + i + '" class="description-div">' +
                    '<input class="comment_text" id="comment_' + i + '" type="text" placeholder="Type your message here"></input>' +
                    '<button class="comment comment_button" id="comment_btn_' + i + '" ticket_id="' + (i + 1) + '" type="button"> Submit </button>' +
                    '</div>' +
                    '</td>';
                table += '<td class="assets assets_' + i + '"><div id="assets_' + i + '" class="assets_div"></div></td>';
                table += '<td class="tags tags_' + i + '"><input id="tags_' + i + '"></input></td>';
                table += '</tr>';
                $("#tickets_data").append(table);
                i++;
                while (!ifExist(i + 1) && i <= max) {
                    i++;
                }
            }

            var statuses = [];

            function checkAvailStatus(id) {
                for (let m = 0; m < statuses.length; m++) {
                    if (statuses[m] == id) {
                        return true;
                    }
                }
                return false;
            }

            function getAuthor(author_id) {
                let author = {};
                for (let i = 0; i < response.users.length; i++) {
                    if (author_id === response.users[i].id) {
                        author.name = response.users[i].name;
                        author.url = response.users[i].url;
                        author.email = response.users[i].email;
                        author.phone = response.users[i].phone;
                        author.role = response.users[i].role;
                    }
                }
                return author;
            }

            function setAuthor(author_id, id) {
                let author = getAuthor(author_id);
                $("#name_" + (id)).attr("href", base_url + "/agent/tickets/" + (id + 1) +
                    "/requester/assigned_tickets").text(author.name);
                $("#phone_" + (id)).text(author.phone);
                $("#email_" + (id)).text(author.email);

            }

            for (let i = 0; i < k; i++) {
                ticket_id = parseInt(response.audits[i].ticket_id);
                author_id = response.audits[i].author_id;
                if (author_id === -1) {
                    if (response.audits[i].events && response.audits[i].events[0].author_id) {
                        author_id = response.audits[i].events[0].author_id;
                    }
                }
                setAuthor(author_id, ticket_id - 1);

                $("#id_" + (ticket_id - 1)).attr("href", base_url + "/agent/tickets/" + ticket_id).text(ticket_id);
                for (let j = 0; j < response.audits[i].events.length; j++) {
                    if (response.audits[i].events[j].type === "Create" && response.audits[i].events[j].field_name === "subject") {
                        $("#subject_" + (ticket_id - 1)).val(response.audits[i].events[j].value);
                    }

                    if (response.audits[i].events[j].type === "VoiceComment") {
                        let author = getAuthor(response.audits[i].events[j].author_id);
                        var author_class = "agent_class";
                        if (author.role === "end-user") {
                            author_class = "requester_class";
                        }

                        let audio = '<audio controls style="width: 100%;">' +
                            '<source src="' + response.audits[i].events[j].data.recording_url + '" type="audio/ogg">' +
                            '<source src="' + response.audits[i].events[j].data.recording_url + '" type="audio/mpeg">' +
                            '</audio>';

                        let comment = '<div class="' + author_class + '">' +
                            '<div class="author_name">' + author.name + '</div>' +
                            '<div class="author_comment">' +
                            audio +
                            '</div>' +
                            '</div>';
                        $("#description_" + (ticket_id - 1)).append(comment);
                        $("#assets_" + (ticket_id - 1)).append(audio);

                    }

                    if (response.audits[i].events[j].type === "Comment") {
                        let author = getAuthor(response.audits[i].events[j].author_id);
                        var author_class = "agent_class";
                        if (author.role === "end-user") {
                            author_class = "requester_class";
                        }
                        let n = 0;
                        let link = "";
                        if (response.audits[i].events[j].attachments.length > n) {
                            link = '<br/>';
                        }
                        while (response.audits[i].events[j].attachments.length > n) {
                            let current_link =
                                '<a href="' + response.audits[i].events[j].attachments[n].content_url + '">' +
                                '&#128206;' + response.audits[i].events[j].attachments[n].file_name +
                                '</a>';
                            link += '<span class="author_files">' +
                                current_link +
                                '</span>';
                            n++;
                            $("#assets_" + (ticket_id - 1)).append(current_link + '<br/>');
                        }

                        let comment = '<div class="' + author_class + '">' +
                            '<div class="author_name">' + author.name + '</div>' +
                            '<div class="author_comment">' + response.audits[i].events[j].body +
                            link +
                            '</div>' +
                            '</div>';

                        $("#description_" + (ticket_id - 1)).append(comment);
                    }

                    if ((response.audits[i].events[j].type === "Create" || response.audits[i].events[j].type === "Change")) {

                        if (!checkAvailStatus(ticket_id - 1)) {
                            let field = response.audits[i].events[j].field_name;
                            if (field === "status") {
                                statuses.push(ticket_id - 1);
                                if (response.audits[i].events[j].value === "closed") {
                                    $("#" + (ticket_id - 1)).addClass("closed");
                                    $("#status_" + (ticket_id - 1) + " option[value='" + response.audits[i].events[j].previous_value + "']").attr("selected", "selected").attr("disabled", true);
                                    $("#subject_" + (ticket_id - 1)).attr("disabled", true);
                                    $("#status_" + (ticket_id - 1)).attr("disabled", true);
                                    $("#type_" + (ticket_id - 1)).attr("disabled", true);
                                    $("#comment_" + (ticket_id - 1)).attr("style", "display:none");
                                    $("#comment_btn_" + (ticket_id - 1)).attr("style", "display:none");
                                    $("#tags_" + (ticket_id - 1)).attr("disabled", true);
                                } else {
                                    $("#status_" + (ticket_id - 1) + " option[value='" + response.audits[i].events[j].value + "']").attr("selected", "selected");
                                }

                            } else if (field === "type") {
                                if (response.audits[i].events[j].value !== null) {
                                    $("#type_" + (ticket_id - 1) + " option[value='" + response.audits[i].events[j].value + "']").attr("selected", "selected");
                                }
                            } else if (field === "tags") {
                                $("#tags_" + (ticket_id - 1)).val(response.audits[i].events[j].value);
                            }
                        }
                    }
                }
            }
        });

    $(document).on('change', 'select', function () {
        var id = $(this).attr('id').split("_");
        var field_name = id[0];
        var ticket_id = parseInt(id[1]) + 1;
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
        var ticket_id = parseInt(id[1]) + 1;

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
                return;
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

    $(document).on('click', '.comment_button', function () {
        var id = parseInt($(this).attr('ticket_id'));
        var comment = $('#comment_' + (id - 1)).val();
        addComment(id, comment);
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
        shiftColumnToBegining("assets");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#assets_left', function () {
        shiftLeftColumn("assets");
        shiftColumnToBegining("selection");
    });

    $(document).on('click', '#assets_right', function () {
        shiftRightColumn("assets");
    });


    $(document).on('click', '#button10', function () {
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
                ids += i + 1;
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
                });
            location.reload(true);

        }
    }

    function addComment(id, comment) {
        id = parseInt(id);
        if (comment === "") {
            return;
        }
        data = {
            ticket: {
                "id": id,
                "comment": comment
            }
        };
        if (id) {
            var options = {
                url: base_url + "/api/v2/tickets/" + id + ".json",
                type: 'PUT',
                contentType: "application/json",
                cors: true,
                data: JSON.stringify(data)
            };
            client.request(options).then(
                function (response) {
                    let special_id = "author_" + new Date().getTime().toString() +
                        Math.floor((Math.random() * 100000) + 1);

                    var option = {
                        url: base_url + "/api/v2/users/" + response.audit.events[0].author_id + ".json",
                        type: 'GET',
                        contentType: "application/json",
                        cors: true
                    };
                    client.request(option).then(
                        function (user) {
                            $('#' + special_id).text(user.user.name);
                        });
                
                    let comment = '<div class="agent_class">' +
                        '<div class="author_name" id="' + special_id + '">You</div>' +
                        '<div class="author_comment">' +
                        response.audit.events[0].body +
                        '</div>' +
                        '</div>';
                    $(comment).insertAfter("#description_" + (id - 1) + " button");
                    $('#comment_' + (id - 1)).val("");
                });
        }
    }

    $(document).on('mouseleave', '.description-div', function (e) {
        $("#assets_" + $(e.currentTarget).attr('id').split("_")[1]).attr("style", "height:" + $(e.currentTarget).height());
    });

    $(document).on('mouseenter', '.description-div', function (e) {
        $("#assets_" + $(e.currentTarget).attr('id').split("_")[1]).attr("style", "height:" + $(e.currentTarget).height());
    });

    $(document).on('mouseenter', '.assets_div', function (e) {
        $("#description_" + $(e.currentTarget).attr('id').split("_")[1]).attr("style", "height:" + $(e.currentTarget).height());
    });

    $(document).on('mouseleave', '.assets_div', function (e) {
        $("#description_" + $(e.currentTarget).attr('id').split("_")[1]).attr("style", "height:" + $(e.currentTarget).height());
    });

});
