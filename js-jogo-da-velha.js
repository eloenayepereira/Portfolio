"use strict";

$(function () {

    window.JV = window.JV || {};

    const SWAL_THEME = {
        background: '#161b22',
        color: '#e6edf3',
        confirmButtonColor: '#7c3aed'
    };

    // Estado do jogo
    let resultj1 = 0;
    let resultj2 = 0;
    let count = 1;
    let currentPlayer = "circle";
    let gameMode = "friend";
    let difficulty = "easy";
    let isComputerTurn = false;

    const WIN_PATTERNS = [
        [1,2,3], [4,5,6], [7,8,9], // horizontais
        [1,4,7], [2,5,8], [3,6,9], // verticais
        [1,5,9], [3,5,7]           // diagonais
    ];

    // ── Inicialização ──────────────────────────────────────────
    JV.CarregarComandos = function () {
        $(document).ready(function () {
            $(document).on("click", ".quadrado", function () {
                if (isComputerTurn) return;
                JV.AcaoClicar(this.id);
            });
            $(document).on("click", "#limpar-jogo",  JV.LimparJogo);
            $(document).on("click", "#add-nomes",    JV.ModalAddNomes);
            $(document).on("click", "#zerar-placar", JV.ZerarPlacar);

            // Seletor de modo
            $(document).on("click", "#mode-amigo", function () { JV.SetMode("friend"); });
            $(document).on("click", "#mode-pc",    function () { JV.SetMode("pc"); });

            // Dificuldade
            $(document).on("click", "#diff-easy", function () {
                difficulty = "easy";
                $("#diff-easy").addClass("active"); $("#diff-hard").removeClass("active");
                JV.LimparJogo();
            });
            $(document).on("click", "#diff-hard", function () {
                difficulty = "hard";
                $("#diff-hard").addClass("active"); $("#diff-easy").removeClass("active");
                JV.LimparJogo();
            });

            JV.AtualizarTurno();
        });
    };

    // ── Modo de jogo ───────────────────────────────────────────
    JV.SetMode = function (mode) {
        gameMode = mode;
        if (mode === "friend") {
            $("#mode-amigo").addClass("active"); $("#mode-pc").removeClass("active");
            $("#difficulty-selector").removeClass("visible");
            $("#label-j2").text("Jogador 2");
            $("#nome-j2").text("Jogador 2");
        } else {
            $("#mode-pc").addClass("active"); $("#mode-amigo").removeClass("active");
            $("#difficulty-selector").addClass("visible");
            $("#label-j2").text("Computador");
            $("#nome-j2").text("Computador");
        }
        JV.LimparJogo();
    };

    // ── Ação de clique no tabuleiro ────────────────────────────
    JV.AcaoClicar = function (idQuadrado) {
        const $quad = $(`#${idQuadrado}`);
        if ($quad.children().length > 0) return;

        $quad.append(`<div class='${currentPlayer}'></div>`);
        count++;

        if (JV.RegraDoJogo()) return; // jogo encerrou

        currentPlayer = currentPlayer === "circle" ? "x" : "circle";
        JV.AtualizarTurno();

        if (gameMode === "pc" && currentPlayer === "x") {
            JV.JogadaComputador();
        }
    };

    // ── Computador ─────────────────────────────────────────────
    JV.JogadaComputador = function () {
        isComputerTurn = true;
        $(".quadrado").addClass("no-hover");
        $("#player2-card").addClass("thinking");

        setTimeout(function () {
            const board = JV.GetBoard();
            const move = difficulty === "hard"
                ? JV.BestMoveMinmax(board)
                : JV.RandomMove(board);

            if (move !== null) {
                $(`#q-${move}`).append("<div class='x'></div>");
                count++;
                if (!JV.RegraDoJogo()) {
                    currentPlayer = "circle";
                    JV.AtualizarTurno();
                }
            }

            isComputerTurn = false;
            $(".quadrado").removeClass("no-hover");
            $("#player2-card").removeClass("thinking");
        }, 550);
    };

    // ── IA: movimento aleatório ────────────────────────────────
    JV.RandomMove = function (board) {
        const livres = [];
        for (let i = 1; i <= 9; i++) { if (!board[i]) livres.push(i); }
        if (!livres.length) return null;
        return livres[Math.floor(Math.random() * livres.length)];
    };

    // ── IA: Minimax com Alpha-Beta ─────────────────────────────
    JV.BestMoveMinmax = function (board) {
        let bestScore = -Infinity, bestMove = null;
        for (let i = 1; i <= 9; i++) {
            if (!board[i]) {
                board[i] = "x";
                const score = JV.Minimax(board, false, -Infinity, Infinity);
                board[i] = null;
                if (score > bestScore) { bestScore = score; bestMove = i; }
            }
        }
        return bestMove;
    };

    JV.Minimax = function (board, isMaximizing, alpha, beta) {
        const winner = JV.CheckWinnerBoard(board);
        if (winner === "x")      return 10;
        if (winner === "circle") return -10;
        const cheio = board.slice(1).every(function (c) { return c !== null; });
        if (cheio) return 0;

        if (isMaximizing) {
            let best = -Infinity;
            for (let i = 1; i <= 9; i++) {
                if (!board[i]) {
                    board[i] = "x";
                    best = Math.max(best, JV.Minimax(board, false, alpha, beta));
                    board[i] = null;
                    alpha = Math.max(alpha, best);
                    if (beta <= alpha) break;
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 1; i <= 9; i++) {
                if (!board[i]) {
                    board[i] = "circle";
                    best = Math.min(best, JV.Minimax(board, true, alpha, beta));
                    board[i] = null;
                    beta = Math.min(beta, best);
                    if (beta <= alpha) break;
                }
            }
            return best;
        }
    };

    // ── Utilidades do tabuleiro ────────────────────────────────
    JV.GetBoard = function () {
        const board = [null]; // índice 1-9
        for (let i = 1; i <= 9; i++) {
            const child = $(`#q-${i}`).children()[0];
            board[i] = child ? child.className : null;
        }
        return board;
    };

    JV.CheckWinnerBoard = function (board) {
        for (const p of WIN_PATTERNS) {
            if (board[p[0]] && board[p[0]] === board[p[1]] && board[p[0]] === board[p[2]])
                return board[p[0]];
        }
        return null;
    };

    // ── Regras ─────────────────────────────────────────────────
    JV.RegraDoJogo = function () {
        const board = JV.GetBoard();
        const winner = JV.CheckWinnerBoard(board);
        if (winner) {
            JV.ModalResultado(winner === "circle" ? "j1" : "j2");
            return true;
        }
        if ($(".quadrado div").length === 9) {
            JV.ModalResultado("empate");
            return true;
        }
        return false;
    };

    // ── Indicador de turno ─────────────────────────────────────
    JV.AtualizarTurno = function () {
        if (currentPlayer === "circle") {
            $("#player1-card").addClass("active-player");
            $("#player2-card").removeClass("active-player");
        } else {
            $("#player2-card").addClass("active-player");
            $("#player1-card").removeClass("active-player");
        }
    };

    // ── Modais ─────────────────────────────────────────────────
    JV.ModalAddNomes = function () {
        if (gameMode === "pc") {
            Swal.fire({
                ...SWAL_THEME,
                title: 'Seu nome',
                html: '<input id="swal-input1" class="swal2-input" placeholder="Seu nome">',
                confirmButtonText: 'Confirmar',
                focusConfirm: false,
                preConfirm: () => {
                    $("#nome-j1").text($('#swal-input1').val() || "Jogador 1");
                }
            });
        } else {
            Swal.fire({
                ...SWAL_THEME,
                title: 'Jogadores',
                html:
                    '<input id="swal-input1" class="swal2-input" placeholder="Nome do Jogador 1">' +
                    '<input id="swal-input2" class="swal2-input" placeholder="Nome do Jogador 2">',
                confirmButtonText: 'Confirmar',
                focusConfirm: false,
                preConfirm: () => {
                    $("#nome-j1").text($('#swal-input1').val() || "Jogador 1");
                    $("#nome-j2").text($('#swal-input2').val() || "Jogador 2");
                }
            });
        }
    };

    JV.ModalResultado = function (result) {
        const nomej1 = $("#nome-j1").text();
        const nomej2 = $("#nome-j2").text();
        // Reset estado antes do modal para evitar race conditions
        count = 1; currentPlayer = "circle"; isComputerTurn = false;
        $(".quadrado").removeClass("no-hover");
        $("#player1-card, #player2-card").removeClass("active-player thinking");

        if (result === "j1") {
            resultj1++;
            $("#result-j1").text(resultj1);
            const msg = gameMode === "pc"
                ? "Você venceu o computador! 🎉"
                : `<b>${nomej1}</b> venceu a partida! 🎉`;
            Swal.fire({ ...SWAL_THEME, title: 'Vitória!', html: msg, icon: 'success' })
                .then(JV.LimparJogo);
        } else if (result === "j2") {
            resultj2++;
            $("#result-j2").text(resultj2);
            const msg = gameMode === "pc"
                ? "O computador venceu! 🤖<br>Tente de novo."
                : `<b>${nomej2}</b> venceu a partida! 🎉`;
            Swal.fire({ ...SWAL_THEME, title: gameMode === "pc" ? "Game Over!" : "Vitória!", html: msg, icon: gameMode === "pc" ? "error" : "success" })
                .then(JV.LimparJogo);
        } else {
            Swal.fire({ ...SWAL_THEME, title: 'Empate!', text: 'Boa partida para os dois!', icon: 'info' })
                .then(JV.LimparJogo);
        }
    };

    // ── Controles ──────────────────────────────────────────────
    JV.LimparJogo = function () {
        $(".quadrado").empty().removeClass("no-hover");
        count = 1;
        currentPlayer = "circle";
        isComputerTurn = false;
        $("#player1-card, #player2-card").removeClass("active-player thinking");
        JV.AtualizarTurno();
    };

    JV.ZerarPlacar = function () {
        resultj1 = 0; resultj2 = 0;
        $("#result-j1").text(0); $("#result-j2").text(0);
        JV.LimparJogo();
    };

    // ── Início ─────────────────────────────────────────────────
    JV.CarregarComandos();
});
