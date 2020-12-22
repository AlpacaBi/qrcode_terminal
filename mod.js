let QRMath = {
    glog: function(n) {
        if (n < 1) {
            throw new Error("glog(" + n + ")");
        }
        return QRMath.LOG_TABLE[n];
    },
    gexp: function(n) {
        while(n < 0){
            n += 255;
        }
        while(n >= 256){
            n -= 255;
        }
        return QRMath.EXP_TABLE[n];
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
};
for(let i = 0; i < 8; i++){
    QRMath.EXP_TABLE[i] = 1 << i;
}
for(let i1 = 8; i1 < 256; i1++){
    QRMath.EXP_TABLE[i1] = QRMath.EXP_TABLE[i1 - 4] ^ QRMath.EXP_TABLE[i1 - 5] ^ QRMath.EXP_TABLE[i1 - 6] ^ QRMath.EXP_TABLE[i1 - 8];
}
for(let i2 = 0; i2 < 255; i2++){
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i2]] = i2;
}
const QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
};
class QRPolynomial {
    constructor(num1, shift){
        if (num1.length === undefined) {
            throw new Error(num1.length + "/" + shift);
        }
        var offset = 0;
        while(offset < num1.length && num1[offset] === 0){
            offset++;
        }
        this.num = new Array(num1.length - offset + shift);
        for(var i3 = 0; i3 < num1.length - offset; i3++){
            this.num[i3] = num1[i3 + offset];
        }
    }
    get(index) {
        return this.num[index];
    }
    getLength() {
        return this.num.length;
    }
    multiply(e) {
        var num1 = new Array(this.getLength() + e.getLength() - 1);
        for(var i4 = 0; i4 < this.getLength(); i4++){
            for(var j = 0; j < e.getLength(); j++){
                num1[i4 + j] ^= QRMath.gexp(QRMath.glog(this.get(i4)) + QRMath.glog(e.get(j)));
            }
        }
        return new QRPolynomial(num1, 0);
    }
    mod(e) {
        if (this.getLength() - e.getLength() < 0) {
            return this;
        }
        var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
        var num1 = new Array(this.getLength());
        for(var i4 = 0; i4 < this.getLength(); i4++){
            num1[i4] = this.get(i4);
        }
        for(var x = 0; x < e.getLength(); x++){
            num1[x] ^= QRMath.gexp(QRMath.glog(e.get(x)) + ratio);
        }
        return new QRPolynomial(num1, 0).mod(e);
    }
}
const QRErrorCorrectLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
};
class QRRSBlock {
    constructor(totalCount, dataCount){
        this.totalCount = totalCount;
        this.dataCount = dataCount;
    }
    static RS_BLOCK_TABLE = [
        [
            1,
            26,
            19
        ],
        [
            1,
            26,
            16
        ],
        [
            1,
            26,
            13
        ],
        [
            1,
            26,
            9
        ],
        [
            1,
            44,
            34
        ],
        [
            1,
            44,
            28
        ],
        [
            1,
            44,
            22
        ],
        [
            1,
            44,
            16
        ],
        [
            1,
            70,
            55
        ],
        [
            1,
            70,
            44
        ],
        [
            2,
            35,
            17
        ],
        [
            2,
            35,
            13
        ],
        [
            1,
            100,
            80
        ],
        [
            2,
            50,
            32
        ],
        [
            2,
            50,
            24
        ],
        [
            4,
            25,
            9
        ],
        [
            1,
            134,
            108
        ],
        [
            2,
            67,
            43
        ],
        [
            2,
            33,
            15,
            2,
            34,
            16
        ],
        [
            2,
            33,
            11,
            2,
            34,
            12
        ],
        [
            2,
            86,
            68
        ],
        [
            4,
            43,
            27
        ],
        [
            4,
            43,
            19
        ],
        [
            4,
            43,
            15
        ],
        [
            2,
            98,
            78
        ],
        [
            4,
            49,
            31
        ],
        [
            2,
            32,
            14,
            4,
            33,
            15
        ],
        [
            4,
            39,
            13,
            1,
            40,
            14
        ],
        [
            2,
            121,
            97
        ],
        [
            2,
            60,
            38,
            2,
            61,
            39
        ],
        [
            4,
            40,
            18,
            2,
            41,
            19
        ],
        [
            4,
            40,
            14,
            2,
            41,
            15
        ],
        [
            2,
            146,
            116
        ],
        [
            3,
            58,
            36,
            2,
            59,
            37
        ],
        [
            4,
            36,
            16,
            4,
            37,
            17
        ],
        [
            4,
            36,
            12,
            4,
            37,
            13
        ],
        [
            2,
            86,
            68,
            2,
            87,
            69
        ],
        [
            4,
            69,
            43,
            1,
            70,
            44
        ],
        [
            6,
            43,
            19,
            2,
            44,
            20
        ],
        [
            6,
            43,
            15,
            2,
            44,
            16
        ],
        [
            4,
            101,
            81
        ],
        [
            1,
            80,
            50,
            4,
            81,
            51
        ],
        [
            4,
            50,
            22,
            4,
            51,
            23
        ],
        [
            3,
            36,
            12,
            8,
            37,
            13
        ],
        [
            2,
            116,
            92,
            2,
            117,
            93
        ],
        [
            6,
            58,
            36,
            2,
            59,
            37
        ],
        [
            4,
            46,
            20,
            6,
            47,
            21
        ],
        [
            7,
            42,
            14,
            4,
            43,
            15
        ],
        [
            4,
            133,
            107
        ],
        [
            8,
            59,
            37,
            1,
            60,
            38
        ],
        [
            8,
            44,
            20,
            4,
            45,
            21
        ],
        [
            12,
            33,
            11,
            4,
            34,
            12
        ],
        [
            3,
            145,
            115,
            1,
            146,
            116
        ],
        [
            4,
            64,
            40,
            5,
            65,
            41
        ],
        [
            11,
            36,
            16,
            5,
            37,
            17
        ],
        [
            11,
            36,
            12,
            5,
            37,
            13
        ],
        [
            5,
            109,
            87,
            1,
            110,
            88
        ],
        [
            5,
            65,
            41,
            5,
            66,
            42
        ],
        [
            5,
            54,
            24,
            7,
            55,
            25
        ],
        [
            11,
            36,
            12
        ],
        [
            5,
            122,
            98,
            1,
            123,
            99
        ],
        [
            7,
            73,
            45,
            3,
            74,
            46
        ],
        [
            15,
            43,
            19,
            2,
            44,
            20
        ],
        [
            3,
            45,
            15,
            13,
            46,
            16
        ],
        [
            1,
            135,
            107,
            5,
            136,
            108
        ],
        [
            10,
            74,
            46,
            1,
            75,
            47
        ],
        [
            1,
            50,
            22,
            15,
            51,
            23
        ],
        [
            2,
            42,
            14,
            17,
            43,
            15
        ],
        [
            5,
            150,
            120,
            1,
            151,
            121
        ],
        [
            9,
            69,
            43,
            4,
            70,
            44
        ],
        [
            17,
            50,
            22,
            1,
            51,
            23
        ],
        [
            2,
            42,
            14,
            19,
            43,
            15
        ],
        [
            3,
            141,
            113,
            4,
            142,
            114
        ],
        [
            3,
            70,
            44,
            11,
            71,
            45
        ],
        [
            17,
            47,
            21,
            4,
            48,
            22
        ],
        [
            9,
            39,
            13,
            16,
            40,
            14
        ],
        [
            3,
            135,
            107,
            5,
            136,
            108
        ],
        [
            3,
            67,
            41,
            13,
            68,
            42
        ],
        [
            15,
            54,
            24,
            5,
            55,
            25
        ],
        [
            15,
            43,
            15,
            10,
            44,
            16
        ],
        [
            4,
            144,
            116,
            4,
            145,
            117
        ],
        [
            17,
            68,
            42
        ],
        [
            17,
            50,
            22,
            6,
            51,
            23
        ],
        [
            19,
            46,
            16,
            6,
            47,
            17
        ],
        [
            2,
            139,
            111,
            7,
            140,
            112
        ],
        [
            17,
            74,
            46
        ],
        [
            7,
            54,
            24,
            16,
            55,
            25
        ],
        [
            34,
            37,
            13
        ],
        [
            4,
            151,
            121,
            5,
            152,
            122
        ],
        [
            4,
            75,
            47,
            14,
            76,
            48
        ],
        [
            11,
            54,
            24,
            14,
            55,
            25
        ],
        [
            16,
            45,
            15,
            14,
            46,
            16
        ],
        [
            6,
            147,
            117,
            4,
            148,
            118
        ],
        [
            6,
            73,
            45,
            14,
            74,
            46
        ],
        [
            11,
            54,
            24,
            16,
            55,
            25
        ],
        [
            30,
            46,
            16,
            2,
            47,
            17
        ],
        [
            8,
            132,
            106,
            4,
            133,
            107
        ],
        [
            8,
            75,
            47,
            13,
            76,
            48
        ],
        [
            7,
            54,
            24,
            22,
            55,
            25
        ],
        [
            22,
            45,
            15,
            13,
            46,
            16
        ],
        [
            10,
            142,
            114,
            2,
            143,
            115
        ],
        [
            19,
            74,
            46,
            4,
            75,
            47
        ],
        [
            28,
            50,
            22,
            6,
            51,
            23
        ],
        [
            33,
            46,
            16,
            4,
            47,
            17
        ],
        [
            8,
            152,
            122,
            4,
            153,
            123
        ],
        [
            22,
            73,
            45,
            3,
            74,
            46
        ],
        [
            8,
            53,
            23,
            26,
            54,
            24
        ],
        [
            12,
            45,
            15,
            28,
            46,
            16
        ],
        [
            3,
            147,
            117,
            10,
            148,
            118
        ],
        [
            3,
            73,
            45,
            23,
            74,
            46
        ],
        [
            4,
            54,
            24,
            31,
            55,
            25
        ],
        [
            11,
            45,
            15,
            31,
            46,
            16
        ],
        [
            7,
            146,
            116,
            7,
            147,
            117
        ],
        [
            21,
            73,
            45,
            7,
            74,
            46
        ],
        [
            1,
            53,
            23,
            37,
            54,
            24
        ],
        [
            19,
            45,
            15,
            26,
            46,
            16
        ],
        [
            5,
            145,
            115,
            10,
            146,
            116
        ],
        [
            19,
            75,
            47,
            10,
            76,
            48
        ],
        [
            15,
            54,
            24,
            25,
            55,
            25
        ],
        [
            23,
            45,
            15,
            25,
            46,
            16
        ],
        [
            13,
            145,
            115,
            3,
            146,
            116
        ],
        [
            2,
            74,
            46,
            29,
            75,
            47
        ],
        [
            42,
            54,
            24,
            1,
            55,
            25
        ],
        [
            23,
            45,
            15,
            28,
            46,
            16
        ],
        [
            17,
            145,
            115
        ],
        [
            10,
            74,
            46,
            23,
            75,
            47
        ],
        [
            10,
            54,
            24,
            35,
            55,
            25
        ],
        [
            19,
            45,
            15,
            35,
            46,
            16
        ],
        [
            17,
            145,
            115,
            1,
            146,
            116
        ],
        [
            14,
            74,
            46,
            21,
            75,
            47
        ],
        [
            29,
            54,
            24,
            19,
            55,
            25
        ],
        [
            11,
            45,
            15,
            46,
            46,
            16
        ],
        [
            13,
            145,
            115,
            6,
            146,
            116
        ],
        [
            14,
            74,
            46,
            23,
            75,
            47
        ],
        [
            44,
            54,
            24,
            7,
            55,
            25
        ],
        [
            59,
            46,
            16,
            1,
            47,
            17
        ],
        [
            12,
            151,
            121,
            7,
            152,
            122
        ],
        [
            12,
            75,
            47,
            26,
            76,
            48
        ],
        [
            39,
            54,
            24,
            14,
            55,
            25
        ],
        [
            22,
            45,
            15,
            41,
            46,
            16
        ],
        [
            6,
            151,
            121,
            14,
            152,
            122
        ],
        [
            6,
            75,
            47,
            34,
            76,
            48
        ],
        [
            46,
            54,
            24,
            10,
            55,
            25
        ],
        [
            2,
            45,
            15,
            64,
            46,
            16
        ],
        [
            17,
            152,
            122,
            4,
            153,
            123
        ],
        [
            29,
            74,
            46,
            14,
            75,
            47
        ],
        [
            49,
            54,
            24,
            10,
            55,
            25
        ],
        [
            24,
            45,
            15,
            46,
            46,
            16
        ],
        [
            4,
            152,
            122,
            18,
            153,
            123
        ],
        [
            13,
            74,
            46,
            32,
            75,
            47
        ],
        [
            48,
            54,
            24,
            14,
            55,
            25
        ],
        [
            42,
            45,
            15,
            32,
            46,
            16
        ],
        [
            20,
            147,
            117,
            4,
            148,
            118
        ],
        [
            40,
            75,
            47,
            7,
            76,
            48
        ],
        [
            43,
            54,
            24,
            22,
            55,
            25
        ],
        [
            10,
            45,
            15,
            67,
            46,
            16
        ],
        [
            19,
            148,
            118,
            6,
            149,
            119
        ],
        [
            18,
            75,
            47,
            31,
            76,
            48
        ],
        [
            34,
            54,
            24,
            34,
            55,
            25
        ],
        [
            20,
            45,
            15,
            61,
            46,
            16
        ]
    ];
    static getRSBlocks(typeNumber, errorCorrectLevel) {
        var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
        if (rsBlock === undefined) {
            throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
        }
        var length = rsBlock.length / 3;
        var list = [];
        for(var i4 = 0; i4 < length; i4++){
            var count = rsBlock[i4 * 3 + 0];
            var totalCount1 = rsBlock[i4 * 3 + 1];
            var dataCount1 = rsBlock[i4 * 3 + 2];
            for(var j = 0; j < count; j++){
                list.push(new QRRSBlock(totalCount1, dataCount1));
            }
        }
        return list;
    }
    static getRsBlockTable(typeNumber, errorCorrectLevel) {
        switch(errorCorrectLevel){
            case QRErrorCorrectLevel.L:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectLevel.M:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectLevel.Q:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectLevel.H:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
                return undefined;
        }
    }
}
class QRBitBuffer {
    constructor(){
        this.buffer = [];
        this.length = 0;
    }
    get(index) {
        var bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
    }
    put(num, length) {
        for(var i4 = 0; i4 < length; i4++){
            this.putBit((num >>> length - i4 - 1 & 1) == 1);
        }
    }
    getLengthInBits() {
        return this.length;
    }
    putBit(bit) {
        var bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
        }
        if (bit) {
            this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
    }
}
const black = `\x1b[48;2;0;0;0m  \x1b[49m`;
const white = `\x1b[48;2;255;255;255m  \x1b[49m`;
const toCell = function(isBlack) {
    return isBlack ? black : white;
};
const repeat = function(color) {
    return {
        times: function(count) {
            return new Array(count).join(color);
        }
    };
};
const fill = function(length, value) {
    let arr = new Array(length);
    for(let i4 = 0; i4 < length; i4++){
        arr[i4] = value;
    }
    return arr;
};
const error = QRErrorCorrectLevel.L;
const setErrorLevel = function(error1) {
    this.error = QRErrorCorrectLevel[error1] || this.error;
};
const QRMode = {
    MODE_NUMBER: 1 << 0,
    MODE_ALPHA_NUM: 1 << 1,
    MODE_8BIT_BYTE: 1 << 2,
    MODE_KANJI: 1 << 3
};
class QR8bitByte {
    constructor(data1){
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.data = data1;
    }
    getLength() {
        return this.data.length;
    }
    write(buffer) {
        for(var i4 = 0; i4 < this.data.length; i4++){
            buffer.put(this.data.charCodeAt(i4), 8);
        }
    }
}
const QRUtil = {
    PATTERN_POSITION_TABLE: [
        [],
        [
            6,
            18
        ],
        [
            6,
            22
        ],
        [
            6,
            26
        ],
        [
            6,
            30
        ],
        [
            6,
            34
        ],
        [
            6,
            22,
            38
        ],
        [
            6,
            24,
            42
        ],
        [
            6,
            26,
            46
        ],
        [
            6,
            28,
            50
        ],
        [
            6,
            30,
            54
        ],
        [
            6,
            32,
            58
        ],
        [
            6,
            34,
            62
        ],
        [
            6,
            26,
            46,
            66
        ],
        [
            6,
            26,
            48,
            70
        ],
        [
            6,
            26,
            50,
            74
        ],
        [
            6,
            30,
            54,
            78
        ],
        [
            6,
            30,
            56,
            82
        ],
        [
            6,
            30,
            58,
            86
        ],
        [
            6,
            34,
            62,
            90
        ],
        [
            6,
            28,
            50,
            72,
            94
        ],
        [
            6,
            26,
            50,
            74,
            98
        ],
        [
            6,
            30,
            54,
            78,
            102
        ],
        [
            6,
            28,
            54,
            80,
            106
        ],
        [
            6,
            32,
            58,
            84,
            110
        ],
        [
            6,
            30,
            58,
            86,
            114
        ],
        [
            6,
            34,
            62,
            90,
            118
        ],
        [
            6,
            26,
            50,
            74,
            98,
            122
        ],
        [
            6,
            30,
            54,
            78,
            102,
            126
        ],
        [
            6,
            26,
            52,
            78,
            104,
            130
        ],
        [
            6,
            30,
            56,
            82,
            108,
            134
        ],
        [
            6,
            34,
            60,
            86,
            112,
            138
        ],
        [
            6,
            30,
            58,
            86,
            114,
            142
        ],
        [
            6,
            34,
            62,
            90,
            118,
            146
        ],
        [
            6,
            30,
            54,
            78,
            102,
            126,
            150
        ],
        [
            6,
            24,
            50,
            76,
            102,
            128,
            154
        ],
        [
            6,
            28,
            54,
            80,
            106,
            132,
            158
        ],
        [
            6,
            32,
            58,
            84,
            110,
            136,
            162
        ],
        [
            6,
            26,
            54,
            82,
            110,
            138,
            166
        ],
        [
            6,
            30,
            58,
            86,
            114,
            142,
            170
        ]
    ],
    G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
    G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
    G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,
    getBCHTypeInfo: function(data1) {
        var d = data1 << 10;
        while(QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0){
            d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
        }
        return (data1 << 10 | d) ^ QRUtil.G15_MASK;
    },
    getBCHTypeNumber: function(data1) {
        var d = data1 << 12;
        while(QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0){
            d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
        }
        return data1 << 12 | d;
    },
    getBCHDigit: function(data1) {
        var digit = 0;
        while(data1 !== 0){
            digit++;
            data1 >>>= 1;
        }
        return digit;
    },
    getPatternPosition: function(typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    getMask: function(maskPattern, i4, j) {
        switch(maskPattern){
            case QRMaskPattern.PATTERN000:
                return (i4 + j) % 2 === 0;
            case QRMaskPattern.PATTERN001:
                return i4 % 2 === 0;
            case QRMaskPattern.PATTERN010:
                return j % 3 === 0;
            case QRMaskPattern.PATTERN011:
                return (i4 + j) % 3 === 0;
            case QRMaskPattern.PATTERN100:
                return (Math.floor(i4 / 2) + Math.floor(j / 3)) % 2 === 0;
            case QRMaskPattern.PATTERN101:
                return i4 * j % 2 + i4 * j % 3 === 0;
            case QRMaskPattern.PATTERN110:
                return (i4 * j % 2 + i4 * j % 3) % 2 === 0;
            case QRMaskPattern.PATTERN111:
                return (i4 * j % 3 + (i4 + j) % 2) % 2 === 0;
            default:
                throw new Error("bad maskPattern:" + maskPattern);
        }
    },
    getErrorCorrectPolynomial: function(errorCorrectLength) {
        var a = new QRPolynomial([
            1
        ], 0);
        for(var i4 = 0; i4 < errorCorrectLength; i4++){
            a = a.multiply(new QRPolynomial([
                1,
                QRMath.gexp(i4)
            ], 0));
        }
        return a;
    },
    getLengthInBits: function(mode, type) {
        if (1 <= type && type < 10) {
            switch(mode){
                case QRMode.MODE_NUMBER:
                    return 10;
                case QRMode.MODE_ALPHA_NUM:
                    return 9;
                case QRMode.MODE_8BIT_BYTE:
                    return 8;
                case QRMode.MODE_KANJI:
                    return 8;
                default:
                    throw new Error("mode:" + mode);
            }
        } else if (type < 27) {
            switch(mode){
                case QRMode.MODE_NUMBER:
                    return 12;
                case QRMode.MODE_ALPHA_NUM:
                    return 11;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 10;
                default:
                    throw new Error("mode:" + mode);
            }
        } else if (type < 41) {
            switch(mode){
                case QRMode.MODE_NUMBER:
                    return 14;
                case QRMode.MODE_ALPHA_NUM:
                    return 13;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 12;
                default:
                    throw new Error("mode:" + mode);
            }
        } else {
            throw new Error("type:" + type);
        }
    },
    getLostPoint: function(qrCode) {
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        var row = 0;
        var col = 0;
        for(row = 0; row < moduleCount; row++){
            for(col = 0; col < moduleCount; col++){
                var sameCount = 0;
                var dark = qrCode.isDark(row, col);
                for(var r = -1; r <= 1; r++){
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }
                    for(var c = -1; c <= 1; c++){
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }
                        if (r === 0 && c === 0) {
                            continue;
                        }
                        if (dark === qrCode.isDark(row + r, col + c)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += 3 + sameCount - 5;
                }
            }
        }
        for(row = 0; row < moduleCount - 1; row++){
            for(col = 0; col < moduleCount - 1; col++){
                var count = 0;
                if (qrCode.isDark(row, col)) count++;
                if (qrCode.isDark(row + 1, col)) count++;
                if (qrCode.isDark(row, col + 1)) count++;
                if (qrCode.isDark(row + 1, col + 1)) count++;
                if (count === 0 || count === 4) {
                    lostPoint += 3;
                }
            }
        }
        for(row = 0; row < moduleCount; row++){
            for(col = 0; col < moduleCount - 6; col++){
                if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
                    lostPoint += 40;
                }
            }
        }
        for(col = 0; col < moduleCount; col++){
            for(row = 0; row < moduleCount - 6; row++){
                if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
                    lostPoint += 40;
                }
            }
        }
        var darkCount = 0;
        for(col = 0; col < moduleCount; col++){
            for(row = 0; row < moduleCount; row++){
                if (qrCode.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;
        return lostPoint;
    }
};
class QRCode {
    constructor(typeNumber1, errorCorrectLevel1){
        this.typeNumber = typeNumber1;
        this.errorCorrectLevel = errorCorrectLevel1;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
    }
    addData(data) {
        let newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = null;
    }
    isDark(row, col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            throw new Error(row + "," + col);
        }
        return this.modules[row][col];
    }
    getModuleCount() {
        return this.moduleCount;
    }
    make() {
        if (this.typeNumber < 1) {
            let typeNumber1 = 1;
            for(typeNumber1 = 1; typeNumber1 < 40; typeNumber1++){
                let rsBlocks = QRRSBlock.getRSBlocks(typeNumber1, this.errorCorrectLevel);
                let buffer = new QRBitBuffer();
                let totalDataCount = 0;
                for(let i4 = 0; i4 < rsBlocks.length; i4++){
                    totalDataCount += rsBlocks[i4].dataCount;
                }
                for(let x = 0; x < this.dataList.length; x++){
                    let data2 = this.dataList[x];
                    buffer.put(data2.mode, 4);
                    buffer.put(data2.getLength(), QRUtil.getLengthInBits(data2.mode, typeNumber1));
                    data2.write(buffer);
                }
                if (buffer.getLengthInBits() <= totalDataCount * 8) break;
            }
            this.typeNumber = typeNumber1;
        }
        this.makeImpl(false, this.getBestMaskPattern());
    }
    makeImpl(test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);
        for(let row = 0; row < this.moduleCount; row++){
            this.modules[row] = new Array(this.moduleCount);
            for(let col = 0; col < this.moduleCount; col++){
                this.modules[row][col] = null;
            }
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }
        if (this.dataCache === null) {
            this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    }
    setupPositionProbePattern(row, col) {
        for(let r = -1; r <= 7; r++){
            if (row + r <= -1 || this.moduleCount <= row + r) continue;
            for(let c = -1; c <= 7; c++){
                if (col + c <= -1 || this.moduleCount <= col + c) continue;
                if (0 <= r && r <= 6 && (c === 0 || c === 6) || 0 <= c && c <= 6 && (r === 0 || r === 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
                    this.modules[row + r][col + c] = true;
                } else {
                    this.modules[row + r][col + c] = false;
                }
            }
        }
    }
    getBestMaskPattern() {
        let minLostPoint = 0;
        let pattern = 0;
        for(let i4 = 0; i4 < 8; i4++){
            this.makeImpl(true, i4);
            let lostPoint = QRUtil.getLostPoint(this);
            if (i4 === 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i4;
            }
        }
        return pattern;
    }
    createMovieClip(target_mc, instance_name, depth) {
        let qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
        let cs = 1;
        this.make();
        for(let row = 0; row < this.modules.length; row++){
            let y = row * cs;
            for(let col = 0; col < this.modules[row].length; col++){
                let x = col * cs;
                let dark = this.modules[row][col];
                if (dark) {
                    qr_mc.beginFill(0, 100);
                    qr_mc.moveTo(x, y);
                    qr_mc.lineTo(x + cs, y);
                    qr_mc.lineTo(x + cs, y + cs);
                    qr_mc.lineTo(x, y + cs);
                    qr_mc.endFill();
                }
            }
        }
        return qr_mc;
    }
    setupTimingPattern() {
        for(let r = 8; r < this.moduleCount - 8; r++){
            if (this.modules[r][6] !== null) {
                continue;
            }
            this.modules[r][6] = r % 2 === 0;
        }
        for(let c = 8; c < this.moduleCount - 8; c++){
            if (this.modules[6][c] !== null) {
                continue;
            }
            this.modules[6][c] = c % 2 === 0;
        }
    }
    setupPositionAdjustPattern() {
        let pos = QRUtil.getPatternPosition(this.typeNumber);
        for(let i4 = 0; i4 < pos.length; i4++){
            for(let j = 0; j < pos.length; j++){
                let row = pos[i4];
                let col = pos[j];
                if (this.modules[row][col] !== null) {
                    continue;
                }
                for(let r = -2; r <= 2; r++){
                    for(let c = -2; c <= 2; c++){
                        if (Math.abs(r) === 2 || Math.abs(c) === 2 || r === 0 && c === 0) {
                            this.modules[row + r][col + c] = true;
                        } else {
                            this.modules[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    }
    setupTypeNumber(test) {
        let bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        let mod;
        for(let i4 = 0; i4 < 18; i4++){
            mod = !test && (bits >> i4 & 1) === 1;
            this.modules[Math.floor(i4 / 3)][i4 % 3 + this.moduleCount - 8 - 3] = mod;
        }
        for(let x = 0; x < 18; x++){
            mod = !test && (bits >> x & 1) === 1;
            this.modules[x % 3 + this.moduleCount - 8 - 3][Math.floor(x / 3)] = mod;
        }
    }
    setupTypeInfo(test, maskPattern) {
        let data2 = this.errorCorrectLevel << 3 | maskPattern;
        let bits = QRUtil.getBCHTypeInfo(data2);
        let mod;
        for(let v = 0; v < 15; v++){
            mod = !test && (bits >> v & 1) === 1;
            if (v < 6) {
                this.modules[v][8] = mod;
            } else if (v < 8) {
                this.modules[v + 1][8] = mod;
            } else {
                this.modules[this.moduleCount - 15 + v][8] = mod;
            }
        }
        for(let h = 0; h < 15; h++){
            mod = !test && (bits >> h & 1) === 1;
            if (h < 8) {
                this.modules[8][this.moduleCount - h - 1] = mod;
            } else if (h < 9) {
                this.modules[8][15 - h - 1 + 1] = mod;
            } else {
                this.modules[8][15 - h - 1] = mod;
            }
        }
        this.modules[this.moduleCount - 8][8] = !test;
    }
    mapData(data, maskPattern) {
        let inc = -1;
        let row = this.moduleCount - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for(let col = this.moduleCount - 1; col > 0; col -= 2){
            if (col === 6) col--;
            while(true){
                for(let c = 0; c < 2; c++){
                    if (this.modules[row][col - c] === null) {
                        let dark = false;
                        if (byteIndex < data.length) {
                            dark = (data[byteIndex] >>> bitIndex & 1) === 1;
                        }
                        let mask = QRUtil.getMask(maskPattern, row, col - c);
                        if (mask) {
                            dark = !dark;
                        }
                        this.modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex === -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    }
    static PAD0 = 236;
    static PAD1 = 17;
    static createData(typeNumber, errorCorrectLevel, dataList) {
        let rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
        let buffer = new QRBitBuffer();
        for(let i4 = 0; i4 < dataList.length; i4++){
            let data2 = dataList[i4];
            buffer.put(data2.mode, 4);
            buffer.put(data2.getLength(), QRUtil.getLengthInBits(data2.mode, typeNumber));
            data2.write(buffer);
        }
        let totalDataCount = 0;
        for(let x = 0; x < rsBlocks.length; x++){
            totalDataCount += rsBlocks[x].dataCount;
        }
        if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
        }
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
        }
        while(buffer.getLengthInBits() % 8 !== 0){
            buffer.putBit(false);
        }
        while(true){
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCode.PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCode.PAD1, 8);
        }
        return QRCode.createBytes(buffer, rsBlocks);
    }
    static createBytes(buffer, rsBlocks) {
        let offset1 = 0;
        let maxDcCount = 0;
        let maxEcCount = 0;
        let dcdata = new Array(rsBlocks.length);
        let ecdata = new Array(rsBlocks.length);
        for(let r = 0; r < rsBlocks.length; r++){
            let dcCount = rsBlocks[r].dataCount;
            let ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for(let i4 = 0; i4 < dcdata[r].length; i4++){
                dcdata[r][i4] = 255 & buffer.buffer[i4 + offset1];
            }
            offset1 += dcCount;
            let rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            let rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
            let modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for(let x = 0; x < ecdata[r].length; x++){
                let modIndex = x + modPoly.getLength() - ecdata[r].length;
                ecdata[r][x] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
            }
        }
        let totalCodeCount = 0;
        for(let y = 0; y < rsBlocks.length; y++){
            totalCodeCount += rsBlocks[y].totalCount;
        }
        let data2 = new Array(totalCodeCount);
        let index = 0;
        for(let z = 0; z < maxDcCount; z++){
            for(let s = 0; s < rsBlocks.length; s++){
                if (z < dcdata[s].length) {
                    data2[index++] = dcdata[s][z];
                }
            }
        }
        for(let xx = 0; xx < maxEcCount; xx++){
            for(let t = 0; t < rsBlocks.length; t++){
                if (xx < ecdata[t].length) {
                    data2[index++] = ecdata[t][xx];
                }
            }
        }
        return data2;
    }
}
const generate = function(input, opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {
        };
    }
    let qrcode = new QRCode(-1, this.error);
    qrcode.addData(input);
    qrcode.make();
    let output = '';
    if (opts && opts.small) {
        let BLACK = true, WHITE = false;
        let moduleCount = qrcode.getModuleCount();
        let moduleData = qrcode.modules.slice();
        let oddRow = moduleCount % 2 === 1;
        if (oddRow) {
            moduleData.push(fill(moduleCount, WHITE));
        }
        let platte = {
            WHITE_ALL: '\u2588',
            WHITE_BLACK: '\u2580',
            BLACK_WHITE: '\u2584',
            BLACK_ALL: ' '
        };
        let borderTop = repeat(platte.BLACK_WHITE).times(moduleCount + 3);
        let borderBottom = repeat(platte.WHITE_BLACK).times(moduleCount + 3);
        output += borderTop + '\n';
        for(let row = 0; row < moduleCount; row += 2){
            output += platte.WHITE_ALL;
            for(let col = 0; col < moduleCount; col++){
                if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === WHITE) {
                    output += platte.WHITE_ALL;
                } else if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === BLACK) {
                    output += platte.WHITE_BLACK;
                } else if (moduleData[row][col] === BLACK && moduleData[row + 1][col] === WHITE) {
                    output += platte.BLACK_WHITE;
                } else {
                    output += platte.BLACK_ALL;
                }
            }
            output += platte.WHITE_ALL + '\n';
        }
        if (!oddRow) {
            output += borderBottom;
        }
    } else {
        let border = repeat(white).times(qrcode.getModuleCount() + 3);
        output += border + '\n';
        qrcode.modules.forEach(function(row) {
            output += white;
            output += row.map(toCell).join('');
            output += white + '\n';
        });
        output += border;
    }
    if (cb) cb(output);
    else console.log(output);
};
export default {
    error,
    generate,
    setErrorLevel
};
